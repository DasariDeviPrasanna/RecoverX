import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not configured");
  }

  if (!clientEmail) {
    throw new Error("FIREBASE_CLIENT_EMAIL is not configured");
  }

  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is not configured");
  }

  // Support both escaped \\n and actual newline characters.
  privateKey = privateKey
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  // Make sure the PEM has proper line breaks.
  if (
    !privateKey.startsWith("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.endsWith("-----END PRIVATE KEY-----")
  ) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY is not in valid PEM format"
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const firebaseAdminApp = getFirebaseAdminApp();

export const firebaseAdminAuth = getAuth(firebaseAdminApp);