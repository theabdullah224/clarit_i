// app/api/facility/delete-patient/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from "@/prisma"

import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Define request params schema using Zod
const paramsSchema = z.object({
  id: z.string().nonempty('Patient ID is required'),
});

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Get the session
  const session = await getServerSession( authOptions);

  // Check if the user is authenticated and is a FACILITY user
  if (!session || session.user.role !== 'FACILITY') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Validate the patient ID
  const parseResult = paramsSchema.safeParse(params);

  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.errors[0].message }, { status: 400 });
  }

  const { id } = parseResult.data;

  try {
    // Check if the patient exists and belongs to the facility user
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient || patient.facilityId !== session.user.id) {
      return NextResponse.json({ message: 'Patient not found or unauthorized' }, { status: 404 });
    }

    // Delete the patient (cascade deletes labResults and reports if set up)
    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Patient deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
