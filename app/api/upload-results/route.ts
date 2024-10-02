// app/api/upload-results/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from "@/prisma"
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]';

// Define request body schema using Zod
const uploadResultsSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Validate request body
  const parseResult = uploadResultsSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.errors[0].message }, { status: 400 });
  }

  const { content } = parseResult.data;

  try {
    const labResult = await prisma.labResult.create({
      data: {
        extractedText: content,
        user: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json({ message: 'Lab result uploaded successfully', labResult }, { status: 200 });
  } catch (error) {
    console.error('Error uploading lab result:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
