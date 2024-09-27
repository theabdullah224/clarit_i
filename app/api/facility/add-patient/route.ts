// app/api/facility/add-patient/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/prisma'; // Adjust this path based on your project structure
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';

// Define request body schema using Zod
const addPatientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  
});

export async function POST(request: Request) {
  // Get the session
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is a FACILITY user
  if (!session || session.user.role !== 'FACILITY') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Parse and validate the request body
  const body = await request.json();
  const parseResult = addPatientSchema.safeParse(body);

  if (!parseResult.success) {
    // Aggregate all validation errors
    const errorMessages = parseResult.error.errors.map(err => err.message).join(', ');
    return NextResponse.json({ message: errorMessages }, { status: 400 });
  }

  const { name, email,  } = parseResult.data;

  try {
    // Check if a patient with the same email already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { email }
    });

    if (existingPatient) {
      return NextResponse.json({ message: 'Patient with this email already exists' }, { status: 409 });
    }

    // Create a new patient linked to the facility user
    const patient = await prisma.patient.create({
      data: {
        name,
        email,
       // Include the phone field
        facility: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json({ message: 'Patient added successfully', patient }, { status: 201 });
  } catch (error) {
    console.error('Error adding patient:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
