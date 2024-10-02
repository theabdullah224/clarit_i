// app/api/auth/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { code, email } = await req.json();

  if (!code || !email) {
    return NextResponse.json(
      { message: "Email and verification code are required." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified." },
        { status: 400 }
      );
    }

    if (user.verificationCode !== code) {
      return NextResponse.json(
        { message: "Invalid verification code." },
        { status: 400 }
      );
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json(
        { message: "Verification code has expired." },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { email },
      data: {
        // @ts-ignore
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return NextResponse.json(
      { message: "Email verified successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email Verification Error:", error);
    return NextResponse.json(
      { message: "Email verification failed." },
      { status: 500 }
    );
  }
}
