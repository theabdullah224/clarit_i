// app/api/facility/fetch-patients/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import prisma from '@/prisma';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';

// Define request body schema using Zod (empty in this case)
const fetchPatientsSchema = z.object({});

export async function POST(request: Request) {
  // Get the session
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is a FACILITY user
  if (!session || session.user.role !== 'FACILITY') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all patients linked to the facility user, including their reports
    const patients = await prisma.patient.findMany({
      where: { facilityId: session.user.id },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
        },
        labResults: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
