// app/api/auth/login/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { idToken, user } = await req.json();

    if (!idToken || !user) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ⚠️ NOTE:
    // We are NOT verifying the Firebase ID token here.
    // This is temporary and not secure for production.

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL || null,
      chatCount: 0,
      totalChats: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings: {
        theme: "dark",
        fontSize: 14,
        autoSave: true
      }
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}