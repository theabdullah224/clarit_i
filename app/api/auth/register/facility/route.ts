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
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clariti Verification Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            width: 98vw;
            margin: auto;

            display: flex;
            align-items: center;
            justify-content: center;
        
        }
        .up{
            max-width: 400px;
            width: 100%;
        }
        .header {
            background-color: #0033A0;
            color: white;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
        }
        .lock-icon {
            font-size: 24px;
        }
        .content {
            padding: 20px;
        }
        .code {
            background-color: #f5f5f5;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            text-align: center;
            margin-top: 40px;
            color: #666;
        }
        a {
            color: #0033A0;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="up">

        <div class="header">
            <div class="logo">Clariti</div>
            <div class="lock-icon">🔒</div>
        </div>
        <div class="content">
            <h1>Welcome to Clariti</h1>
            <p>Hi ${name || "Facility User"},</p>
            <p>Your verification code is:</p>
            <div class="code">${verificationCode}</div>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't request this code, someone may be trying to access your account. Please <a href="#">update your password</a>, and if you need more help or want to report suspicious activity, please <a href="#">contact us</a>.</p>
            <p>Yours sincerely,</p>
            <p>The Clariti Security Team</p>
        </div>
    <div class="footer">
        © 2024 Clariti<br>
        123 Main Street, Anytown, AN 12345
    </div>
</div>
</body>
</html>
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
