// app/api/facility/upload-lab-result/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import prisma from '@/prisma';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]';

// Define request body schema using Zod
const uploadLabResultSchema = z.object({
  patientId: z.string().nonempty('Patient ID is required'),
  content: z.string().min(1, 'Content is required'),
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
  const parseResult = uploadLabResultSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.errors[0].message }, { status: 400 });
  }

  const { patientId, content } = parseResult.data;

  try {
    // Check if the patient exists and belongs to the facility user
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.facilityId !== session.user.id) {
      return NextResponse.json({ message: 'Patient not found or unauthorized' }, { status: 404 });
    }

    // Create a new LabResult linked to the patient and facility user
    const labResult = await prisma.labResult.create({
      data: {
        extractedText: content,
        patient: {
          connect: { id: patientId },
        },
        user: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json({ message: 'Lab result uploaded successfully', labResult }, { status: 201 });
  } catch (error) {
    console.error('Error uploading lab result:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
