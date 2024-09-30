// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

// Configure your email transporter (example using Gmail)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: parseInt('465'),
  auth: {
    user: "labs@moreclariti.com",
    pass: "befj vneq aklt ekoh",
  },
});


function generateVerificationCode(): string {
  // Generate a random number between 0 and 999999
  const randomNumber = Math.floor(Math.random() * 1000000);
  
  // Pad the number with leading zeros if necessary to ensure it's always 6 digits
  return randomNumber.toString().padStart(6, '0');
}

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "User with this email already exists" },
      { status: 400 }
    );
  }

  // Generate email verification token
  const verificationCode = generateVerificationCode()
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        verificationCode,
        verificationExpires,
      },
    });

    // Send verification email
    // const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?code=${verificationCode}&email=${encodeURIComponent(
    //   email
    // )}`;

    const mailOptions = {
      from: "labs@moreclariti.com",
      to: email,
      subject: "Verify your email",
      html: `
        <p>Hi ${name || "User"},</p>
        <p>Thank you for registering with Clariti Health Insights. Please use the following verification code to complete the sign up process:</p>
        <h2>${verificationCode}</h2>
        <p>This one-time code will expire in one hour. Do not share this code with others.</p>
        <p>Yours Truly</p>
        <p>The Clariti Health Insights Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Registration successful! Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
