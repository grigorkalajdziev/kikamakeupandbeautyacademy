import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  FacebookAuthProvider,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase, ref, set, push, get, update, remove } from "firebase/database";
import type { NextApiRequest, NextApiResponse } from "next";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL:       `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     "G-ZL2EBV00H7",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const database = getDatabase(app);
export const storage  = getStorage(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);

const generateCoupon = (): string => {
  const prefixes = ["MAKEUP", "BEAUTY", "GLAM", "KIKA"];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${Math.floor(1000 + Math.random() * 9000)}`;
};

export async function checkUserExists(userId: string): Promise<boolean> {
  try {
    const snap = await get(ref(database, `users/${userId}`));
    return snap.exists();
  } catch { return false; }
}

export async function checkPhoneExists(phone: string): Promise<boolean> {
  try {
    const snap = await get(ref(database, "users"));
    if (!snap.exists()) return false;
    return Object.values(snap.val() as Record<string, { billingInfo?: { phone?: string } }>)
      .some((u) => u?.billingInfo?.phone === phone);
  } catch { return false; }
}

export interface RegisterResult { success: boolean; coupon?: string; error?: string }

export async function registerUser(
  email: string, password: string, firstName: string, lastName: string
): Promise<RegisterResult> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const coupon = generateCoupon();
    await set(ref(database, `users/${user.uid}`), {
      email, firstName, lastName,
      displayName: `${firstName} ${lastName}`,
      billingInfo: { address: "", city: "", phone: "", zipCode: "" },
      role: "guest", password, coupon,
    });
    await signOut(auth);
    return { success: true, coupon };
  } catch (e) { return { success: false, error: (e as Error).message }; }
}

export async function registerGoogleUser(user: { uid: string; email: string | null; displayName: string | null }): Promise<RegisterResult> {
  try {
    const coupon = generateCoupon();
    await set(ref(database, `users/${user.uid}`), {
      email: user.email, displayName: user.displayName ?? "",
      firstName: "", lastName: "",
      billingInfo: { address: "", city: "", phone: "", zipCode: "" },
      role: "guest", coupon,
    });
    return { success: true, coupon };
  } catch (e) { return { success: false, error: (e as Error).message }; }
}

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
export const googleProvider = new GoogleAuthProvider();

export { push, ref, set, get, update, remove };

// ── API route handler placeholder ────────────────────────────────────────────
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(405).json({ error: "Method not allowed" });
}
