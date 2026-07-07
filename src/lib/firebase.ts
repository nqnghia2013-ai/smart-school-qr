import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Add Google Workspace scopes
googleProvider.addScope('https://www.googleapis.com/auth/documents.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/meetings.space.created');

// Cache the access token in-memory
let cachedAccessToken: string | null = null;

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
            cachedAccessToken = credential.accessToken;
        }
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
}

export const getAccessToken = (): string | null => {
    return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
    cachedAccessToken = token;
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        cachedAccessToken = null;
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
}

