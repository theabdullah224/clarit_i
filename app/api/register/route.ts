import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/app/helpers/db";
import prisma from "@/prisma";
import { sendVerificationEmail } from "@/app/helpers/email";

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      // fullName,
      // telephone,
      // facilityName,
      // facilityType,
      // address,
      // city,
      // stateProvince,
      // country,
      termsAgreed,
    } = await req.json();

    if (!email || !password || !termsAgreed) {
      return NextResponse.json({ message: "Invalid Data" }, { status: 422 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await connectToDB();

    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        // fullName,
        // telephone,
        // facilityName,
        // facilityType,
        // address,
        // city,
        // stateProvince,
        // country,
        termsAgreed,
        verificationCode,
        verificationExpires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ message: "User registered. Please check your email for the verification code." }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}