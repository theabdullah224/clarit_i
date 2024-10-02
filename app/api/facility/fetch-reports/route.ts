// app/api/facility/fetch-reports/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import prisma from '@/prisma'; // Ensure this path is correct based on your project structure
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]';

// Define request body schema using Zod
const fetchReportsSchema = z.object({
  patientId: z.string().nonempty('Patient ID is required'),
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
  const parseResult = fetchReportsSchema.safeParse(body);

  if (!parseResult.success) {
    // Aggregate all validation errors
    const errorMessages = parseResult.error.errors.map(err => err.message).join(', ');
    return NextResponse.json({ message: errorMessages }, { status: 400 });
  }

  const { patientId } = parseResult.data;

  try {
    // Fetch all reports linked to the patient
    const reports = await prisma.report.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
