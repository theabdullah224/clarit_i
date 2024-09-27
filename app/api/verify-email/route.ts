import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
  }

  try {
    // Find the user by verification code
    const user = await prisma.user.findFirst({
      where: { verificationCode: code },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) { 
      return NextResponse.json({ error: 'Expired verification code' }, { status: 400 });
    }

    // Update the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}