// app/api/fetch-reports/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import prisma from '@/prisma';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';

// Define request body schema using Zod (empty in this case)
const fetchReportsSchema = z.object({});

export async function POST(request: Request) {
  // Get the session
  const session = await getServerSession( authOptions);

  // Check if the user is authenticated
  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all reports linked to the user
    const reports = await prisma.report.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
