import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  serverTimestamp, 
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import rawLocalConfig from '@/firebase-applet-config.json';
import type { SurveyFormData, SurveyResponseFirestoreDoc, SurveyContactFirestoreDoc } from '../types/survey';

// Load config from environment variables or bundled config
let firebaseConfig: any = null;

try {
  // Check vite env
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (apiKey && projectId) {
    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)'
    };
  }
} catch {
  // Ignore env access errors
}

// Fallback to local applet config if env vars are empty
if (!firebaseConfig || !firebaseConfig.apiKey) {
  if (rawLocalConfig && (rawLocalConfig as any).apiKey) {
    firebaseConfig = rawLocalConfig;
  }
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("MY_")
);

export const app = isFirebaseConfigured 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

export const auth = app ? getAuth(app) : null;
export const db: Firestore | null = (app && firebaseConfig) 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)') 
  : null;

export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth;
  const user = currentAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
      isAnonymous: user?.isAnonymous,
      tenantId: user?.tenantId,
      providerInfo: user?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Test connection to Firestore on initialization
 */
export async function testConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline. Check Firebase configuration.");
      return false;
    }
    // A permission denied error on connection test is still proof that the database is reachable
    return true;
  }
}

export let isAnonymousAuthDisabled = false;

/**
 * Ensure anonymous sign-in for survey respondent
 */
export async function ensureAnonymousUser(): Promise<{ uid: string; isAnonymous: boolean }> {
  if (!auth) {
    throw new Error("ระบบ Firebase ยังไม่ได้กำหนดค่า (Firebase not configured)");
  }
  if (auth.currentUser) {
    return { uid: auth.currentUser.uid, isAnonymous: auth.currentUser.isAnonymous };
  }
  try {
    const credential = await signInAnonymously(auth);
    isAnonymousAuthDisabled = false;
    return { uid: credential.user.uid, isAnonymous: true };
  } catch (err: any) {
    if (err?.code === 'auth/admin-restricted-operation' || err?.message?.includes('admin-restricted-operation')) {
      isAnonymousAuthDisabled = true;
      console.warn(
        "Firebase Anonymous Sign-in is not enabled in the Firebase Console. " +
        "To enable it, visit: https://console.firebase.google.com/project/alpine-insight-1t3g1/authentication/providers"
      );
      // Fallback to client-scoped deterministic ID so the app remains functional
      let localUid = localStorage.getItem('nu_football_anon_uid');
      if (!localUid) {
        localUid = 'anon_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('nu_football_anon_uid', localUid);
      }
      return { uid: localUid, isAnonymous: true };
    }
    console.warn("Anonymous sign-in error:", err);
    throw err;
  }
}

export const SURVEY_VERSION = "2569_v1";

/**
 * Deterministic document ID to prevent duplicate submissions per user and version
 */
export function getSurveyDocId(userId: string): string {
  return `${userId}_${SURVEY_VERSION}`;
}

/**
 * Check if the user already submitted a survey
 */
export async function checkExistingSubmission(userId: string): Promise<boolean> {
  if (!db) return false;
  const docId = getSurveyDocId(userId);
  const path = `survey_responses/${docId}`;
  try {
    const snap = await getDoc(doc(db, 'survey_responses', docId));
    return snap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

/**
 * Submit survey response to Firestore
 * Separates survey answers from contact information into distinct collections.
 */
export async function submitSurvey(formData: SurveyFormData): Promise<{ success: boolean; docId: string }> {
  if (!isFirebaseConfigured || !db || !auth) {
    throw new Error("ไม่สามารถบันทึกข้อมูลได้ เนื่องจากระบบอยู่ในโหมดที่ยังไม่ได้เชื่อมต่อฐานข้อมูล Firebase");
  }

  // Ensure user is signed in anonymously or authenticated
  const user = await ensureAnonymousUser();
  const docId = getSurveyDocId(user.uid);

  // 1. Prepare Survey Response Doc (WITHOUT Personal Contact Info)
  const responsePath = `survey_responses/${docId}`;
  const responseData: Partial<SurveyResponseFirestoreDoc> = {
    id: docId,
    userId: user.uid,
    surveyVersion: SURVEY_VERSION,
    isNUPersonnel: formData.isNUPersonnel,
    primaryDepartmentId: formData.primaryDepartmentId,
    primaryDepartmentName: formData.primaryDepartmentName,
    customDepartmentName: formData.customDepartmentName || '',
    subDepartment: formData.subDepartment || '',
    agreementLevel: formData.agreementLevel as any,
    expectedBenefits: formData.expectedBenefits || [],
    concerns: formData.concerns || '',
    suggestions: formData.suggestions || '',
    intent: formData.intent as any,
    activityTypes: formData.intent !== 'feedback_only' ? formData.activityTypes : [],
    experienceLevel: formData.intent !== 'feedback_only' ? formData.experienceLevel : '',
    frequency: formData.intent !== 'feedback_only' ? formData.frequency : '',
    obstacles: formData.intent !== 'feedback_only' ? formData.obstacles : [],
    otherObstacle: formData.otherObstacle || '',
    preferredTimeSlots: formData.intent !== 'feedback_only' ? formData.preferredTimeSlots : [],
    supportRoles: formData.intent !== 'feedback_only' ? formData.supportRoles : [],
    interestedAreas: formData.intent !== 'feedback_only' ? formData.interestedAreas : [],
    otherAreaDescription: formData.otherAreaDescription || '',
    hasContactInfo: formData.intent !== 'feedback_only' && Boolean(formData.fullName && (formData.phone || formData.email)),
    acknowledgedDisclaimer: formData.acknowledgedDisclaimer,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'survey_responses', docId), responseData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, responsePath);
  }

  // 2. Prepare Contact Info Doc (ONLY if seeking membership or news, separated from responses)
  if (formData.intent !== 'feedback_only' && (formData.fullName.trim().length > 0)) {
    const contactPath = `survey_contacts/${docId}`;
    const contactData: Partial<SurveyContactFirestoreDoc> = {
      id: docId,
      userId: user.uid,
      surveyVersion: SURVEY_VERSION,
      fullName: formData.fullName.trim(),
      phone: formData.phone?.trim() || '',
      email: formData.email?.trim() || '',
      primaryDepartmentName: formData.primaryDepartmentName,
      intent: formData.intent as any,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'survey_contacts', docId), contactData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, contactPath);
    }
  }

  return { success: true, docId };
}

/**
 * Check if an email is in the admin allowlist
 */
export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const envAdmins = import.meta.env.VITE_ADMIN_EMAILS || 'phasharak@gmail.com';
  const list = envAdmins.split(',').map((e: string) => e.trim().toLowerCase());
  return list.includes(email.toLowerCase()) || email.toLowerCase() === 'phasharak@gmail.com';
}

/**
 * Fetch all survey responses for the Admin Dashboard
 */
export async function getAdminSurveyData(): Promise<{
  responses: SurveyResponseFirestoreDoc[];
  contacts: SurveyContactFirestoreDoc[];
}> {
  if (!db) {
    throw new Error("Firebase ฐานข้อมูลยังไม่ได้เชื่อมต่อ");
  }

  const responsesPath = 'survey_responses';
  const contactsPath = 'survey_contacts';
  
  let responses: SurveyResponseFirestoreDoc[] = [];
  let contacts: SurveyContactFirestoreDoc[] = [];

  try {
    const respSnap = await getDocs(collection(db, responsesPath));
    responses = respSnap.docs.map(d => ({ ...(d.data() as SurveyResponseFirestoreDoc), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, responsesPath);
  }

  try {
    const contactSnap = await getDocs(collection(db, contactsPath));
    contacts = contactSnap.docs.map(d => ({ ...(d.data() as SurveyContactFirestoreDoc), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, contactsPath);
  }

  return { responses, contacts };
}
