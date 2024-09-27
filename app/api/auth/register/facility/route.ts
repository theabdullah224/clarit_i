// app/api/auth/register/facility/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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
  const {
    name,
    email,
    password,
    role,
    facilityName,
    facilityType,
    address,
    city,
    stateProvince,
    country,
    telephone,
  } = await req.json();

  // Input Validation
  if (
    !email ||
    !password ||
    !facilityName ||
    !facilityType ||
    !address ||
    !city ||
    !stateProvince ||
    !country ||
    !telephone
  ) {
    return NextResponse.json(
      { message: "All fields are required for facility registration." },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "User with this email already exists." },
      { status: 400 }
    );
  }

  // Generate email verification token
  const verificationCode = generateVerificationCode()
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    // Create new facility user with hashed password
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store hashed password
        role: "FACILITY", // Fixed role
        facilityName,
        facilityType,
        address,
        city,
        stateProvince,
        country,
        telephone,
        verificationCode,
        verificationExpires,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?code=${verificationCode}&email=${encodeURIComponent(
      email
    )}`;

    const mailOptions = {
        from: "labs@moreclariti.com",
      to: email,
      subject: "Verify your email",
      html: `
        <p>Hello ${name || "Facility User"},</p>
        <p>Thank you for registering your facility at HealthPlatform. Please verify your email by using this code:</p>
        <p>Your verification code is:</p>
        <h2>${verificationCode}</h2>
        <p>This code will expire in 24 hours.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Registration successful! Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Facility Registration Error:", error);
    return NextResponse.json(
      { message: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
}
