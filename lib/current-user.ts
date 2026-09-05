import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";

const SESSION_COOKIE = "recoverx_session";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const sessionCookie =
      cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims =
      await firebaseAdminAuth.verifySessionCookie(
        sessionCookie,
        true
      );

    const firebaseUid = decodedClaims.uid;

    const user = await db.user.findUnique({
      where: {
        firebaseUid,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "Current user authentication error:",
      error
    );

    return null;
  }
}