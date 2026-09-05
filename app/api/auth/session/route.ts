import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";

const SESSION_COOKIE = "recoverx_session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const idToken = String(body.idToken || "").trim();

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase ID token is required",
        },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token on the server.
    const decodedToken =
      await firebaseAdminAuth.verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase account does not have an email",
        },
        { status: 400 }
      );
    }

    const name =
  decodedToken.name ||
  email.split("@")[0] ||
  "Merchant";

const businessName = body.businessName
  ? String(body.businessName).trim()
  : null;

    // Create the RecoverX user if this is the first login.
    // Otherwise update the existing user's details.
    const user = await db.user.upsert({
      where: {
        firebaseUid,
      },
      create: {
        firebaseUid,
        name,
        email,
      },
      update: {
        name,
        email,
      },
    });

    // Create a Firebase session cookie.
    const expiresIn = 1000 * 60 * 60 * 24 * 5;

    const sessionCookie =
      await firebaseAdminAuth.createSessionCookie(
        idToken,
        {
          expiresIn,
        }
      );

    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
      },
    });
  } catch (error) {
    console.error(
      "Firebase session creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create authentication session",
      },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete(SESSION_COOKIE);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Firebase session deletion error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to sign out",
      },
      { status: 500 }
    );
  }
}