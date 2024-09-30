// app/api/fetch-lab-results/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import prisma from '@/prisma';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';

// Define request body schema if needed (currently, no body is required)
const fetchLabResultsSchema = z.object({});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const labResults = await prisma.labResult.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: 'desc' },
      take: 1, // Fetch only the latest 5 results
    });
    // console.log("--------------->>>>>>>>",labResults)

    return NextResponse.json({ labResults }, { status: 200 });
  } catch (error) {
    console.error('Error fetching lab results:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
