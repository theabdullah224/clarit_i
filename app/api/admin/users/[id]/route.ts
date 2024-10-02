// app/api/admin/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { PrismaClient, Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        telephone: true,
        facilityName: true,
        facilityType: true,
        address: true,
        city: true,
        stateProvince: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { message: "Admins cannot delete themselves." },
        { status: 400 }
      );
    }

    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "User deleted successfully.", user: deletedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const {
    name,
    email,
    role,
    telephone,
    facilityName,
    facilityType,
    address,
    city,
    stateProvince,
    country,
  } = await req.json();

  // Prevent admin from changing their own role or deleting themselves
  if (id === session.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { message: "Admins cannot change their own role." },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        telephone,
        facilityName,
        facilityType,
        address,
        city,
        stateProvince,
        country,
      },
    });

    return NextResponse.json(
      { message: "User updated successfully.", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user." },
      { status: 500 }
    );
  }
}
