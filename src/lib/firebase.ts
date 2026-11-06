/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

import firebaseAppletConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Gmail send scope used specifically for dispatching auction summary reports
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
];

// In-memory token cache for Workspace APIs (never stored in localStorage)
let cachedAccessToken: string | null = null;
export const getAccessToken = (): string | null => cachedAccessToken;
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

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

// Official Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCwWqHESkCd6aN1jkxtdng2T9ZMGw8YaFc",
  authDomain: "ipl-auction-54817.firebaseapp.com",
  projectId: "ipl-auction-54817",
  storageBucket: "ipl-auction-54817.firebasestorage.app",
  messagingSenderId: "101570704926",
  appId: "1:101570704926:web:57ce998640f2b49849e00f",
  measurementId: "G-D3E895SB2X",
};

// Initialize Firebase App
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export auth instance
export const auth: Auth = getAuth(app);

// Export db instance (uses default Firestore or configured database ID if specified)
export const db: Firestore = (firebaseAppletConfig as any)?.firestoreDatabaseId
  ? getFirestore(app, (firebaseAppletConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Export optional analytics instance
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

export const isFirebaseConfigured = (): boolean => Boolean(app && auth && db);

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo:
        auth?.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Saves or updates user profile in Firestore at /users/{uid}.
 * Follows firestore.rules validation strictly to ensure:
 * - No duplicate user records are created
 * - Affected keys on update only modify ['displayName', 'selectedTeamId', 'role']
 */
export async function syncUserProfileInFirestore(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  selectedTeamId?: string | null;
  role?: 'Owner' | 'Auctioneer' | 'Spectator';
}): Promise<{ success: boolean; error?: string }> {
  if (!db || !auth.currentUser) {
    return { success: false, error: 'Firestore or Auth instance not ready' };
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Document already exists: Update without creating duplicate records
      const existing = userSnap.data();
      await updateDoc(userRef, {
        displayName: user.displayName || existing.displayName || 'Franchise Director',
        selectedTeamId: user.selectedTeamId || existing.selectedTeamId || 'csk',
        role: user.role || existing.role || 'Owner',
      });
    } else {
      // Document does not exist: Create initial profile record matching isValidUser schema
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Franchise Director',
        email: user.email || '',
        selectedTeamId: user.selectedTeamId || 'csk',
        role: user.role || 'Owner',
        createdAt: new Date().toISOString(),
      });
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Firestore profile sync note:', err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * Google Sign-In helper function configured cleanly for standard authentication.
 * Uses standard Identity scopes (profile, email, openid) so authentication is not
 * blocked by Google restricted-scope verification requirements.
 */
export async function loginWithGoogle(): Promise<{
  success: boolean;
  user?: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL?: string | null;
  };
  accessToken?: string | null;
  error?: string;
  isAccessDenied?: boolean;
}> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    // Use standard, unverified-safe Google Identity scopes
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('openid');

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setCachedAccessToken(credential.accessToken);
    }

    const authedUser = {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
    };

    // Save or update user profile in Firestore without duplicate records
    await syncUserProfileInFirestore({
      uid: authedUser.uid,
      displayName: authedUser.displayName,
      email: authedUser.email,
      selectedTeamId: 'csk',
      role: 'Owner',
    });

    return {
      success: true,
      user: authedUser,
      accessToken: cachedAccessToken,
    };
  } catch (err: any) {
    console.warn('Google sign-in error:', err);
    const code = err?.code || '';
    const message = err?.message || '';

    let formattedError = 'Google authentication was cancelled or interrupted.';
    let isAccessDenied = false;

    if (code === 'auth/popup-closed-by-user') {
      formattedError = 'Google sign-in popup was closed before completing authentication.';
    } else if (code === 'auth/cancelled-popup-request') {
      formattedError = 'Google sign-in request was cancelled.';
    } else if (code === 'auth/popup-blocked') {
      formattedError = 'Sign-in popup was blocked by browser. Please allow popups for this site and try again.';
    } else if (code === 'auth/unauthorized-domain') {
      formattedError = 'Domain not authorized. Please add this domain to Firebase Console > Authentication > Settings > Authorized Domains.';
    } else if (
      code === 'auth/access-denied' ||
      message.includes('403') ||
      message.includes('access_denied') ||
      message.includes('verification process')
    ) {
      isAccessDenied = true;
      formattedError =
        'Error 403 (Access Denied): Google OAuth is in Testing Mode. Please ensure your Google account email is added as an authorized Test User in Google Cloud Console (APIs & Services > OAuth consent screen > Test users).';
    } else if (code === 'auth/account-exists-with-different-credential') {
      formattedError = 'An account already exists with this email address under a different login method.';
    } else if (message) {
      formattedError = message;
    }

    return {
      success: false,
      error: formattedError,
      isAccessDenied,
    };
  }
}

/**
 * Incremental authorization helper to request Gmail dispatch permission on-demand.
 * Separated from basic authentication so login is never blocked.
 */
export async function requestGmailAuthorization(): Promise<{
  success: boolean;
  accessToken?: string | null;
  error?: string;
}> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
    provider.setCustomParameters({ prompt: 'consent' });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setCachedAccessToken(credential.accessToken);
      return { success: true, accessToken: credential.accessToken };
    }
    return { success: false, error: 'Could not obtain access token.' };
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.message ||
        'Gmail authorization was denied. In Testing Mode, add your account as an authorized test user in Google Cloud Console.',
    };
  }
}

// Email & Password Login helper
export async function loginWithEmail(
  email: string,
  pass: string
): Promise<{
  success: boolean;
  user?: { uid: string; displayName: string | null; email: string | null };
  error?: string;
}> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const authed = {
      uid: result.user.uid,
      displayName: result.user.displayName || email.split('@')[0],
      email: result.user.email,
    };

    // Sync to Firestore without duplicate
    await syncUserProfileInFirestore({
      uid: authed.uid,
      displayName: authed.displayName,
      email: authed.email,
      selectedTeamId: 'csk',
      role: 'Owner',
    });

    return {
      success: true,
      user: authed,
    };
  } catch (err: any) {
    const code = err?.code;
    let msg = 'Failed to sign in. Please verify your credentials.';
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'
    ) {
      msg = 'Invalid email or password.';
    } else if (code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    }
    return { success: false, error: msg };
  }
}

// Email Registration helper
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<{
  success: boolean;
  user?: { uid: string; displayName: string | null; email: string | null };
  error?: string;
}> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    const authed = {
      uid: result.user.uid,
      displayName: displayName || result.user.displayName,
      email: result.user.email,
    };

    // Sync to Firestore without duplicate
    await syncUserProfileInFirestore({
      uid: authed.uid,
      displayName: authed.displayName,
      email: authed.email,
      selectedTeamId: 'csk',
      role: 'Owner',
    });

    return {
      success: true,
      user: authed,
    };
  } catch (err: any) {
    const code = err?.code;
    let msg = 'Registration failed.';
    if (code === 'auth/email-already-in-use') {
      msg = 'This email is already registered. Please sign in instead.';
    } else if (code === 'auth/weak-password') {
      msg = 'Password is too weak. Please use at least 6 characters.';
    }
    return { success: false, error: msg };
  }
}

// Password Reset helper
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to send password reset email.',
    };
  }
}

// User Logout helper
export async function logoutUser(): Promise<void> {
  setCachedAccessToken(null);
  try {
    await signOut(auth);
  } catch {
    // Ignore error on sign out
  }
}

/**
 * Syncs an Auction Room document to Firestore at /rooms/{roomId}.
 */
export async function syncRoomToFirestore(room: {
  id: string;
  code: string;
  name: string;
  hostId: string;
  status: string;
  format?: string;
  bidTimerSeconds?: number;
  retentions?: Record<string, any>;
  teamAssignments?: Record<string, any>;
  participants?: any[];
  currentBid?: any;
  bidHistory?: any[];
  currentPlayerIndex?: number;
}): Promise<{ success: boolean; error?: string }> {
  if (!db || !auth.currentUser) {
    return { success: false, error: 'Firestore or Auth instance not ready' };
  }

  try {
    const roomRef = doc(db, 'rooms', room.id);
    const roomSnap = await getDoc(roomRef);

    const payload: Record<string, any> = {
      code: room.code,
      name: room.name,
      hostId: room.hostId,
      status: room.status,
      updatedAt: new Date().toISOString(),
    };

    if (room.format) payload.format = room.format;
    if (typeof room.bidTimerSeconds === 'number') payload.bidTimerSeconds = room.bidTimerSeconds;
    if (room.retentions) payload.retentions = room.retentions;
    if (room.teamAssignments) payload.teamAssignments = room.teamAssignments;
    if (room.participants) payload.participants = room.participants;
    if (typeof room.currentPlayerIndex === 'number') payload.currentPlayerIndex = room.currentPlayerIndex;
    if (room.currentBid) {
      payload.currentBid = room.currentBid;
      payload.highestBidAmount = room.currentBid.amount;
      payload.highestBidderTeamId = room.currentBid.teamId;
    }
    if (room.bidHistory) payload.bidHistory = room.bidHistory;

    if (roomSnap.exists()) {
      await updateDoc(roomRef, payload);
    } else {
      await setDoc(roomRef, payload);
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Firestore room sync note:', err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * Real-time listener for an active auction room in Firestore.
 */
export function subscribeToRoom(
  roomId: string,
  onUpdate: (data: any) => void,
  onError?: (error: Error) => void
): () => void {
  if (!db) return () => {};
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(
    roomRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    },
    (err) => {
      console.warn('Firestore room subscription note:', err?.message || err);
      if (onError) onError(err);
    }
  );
}

/**
 * Record an immutable bid transaction to the room's bids subcollection.
 */
export async function recordBidInFirestore(
  roomId: string,
  bid: {
    bidId: string;
    playerId: string;
    teamId: string;
    amount: number;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!db || !auth.currentUser) {
    return { success: false, error: 'Firestore or Auth instance not ready' };
  }

  try {
    const bidRef = doc(db, 'rooms', roomId, 'bids', bid.bidId);
    await setDoc(bidRef, {
      bidId: bid.bidId,
      roomId,
      playerId: bid.playerId,
      teamId: bid.teamId,
      amount: bid.amount,
      userId: auth.currentUser.uid,
      timestamp: Date.now(),
    });
    return { success: true };
  } catch (err: any) {
    console.warn('Firestore bid record note:', err?.message || err);
    return { success: false, error: err?.message };
  }
}
