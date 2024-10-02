import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/prisma'; // Adjust this path based on your project structure
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]';

// Define request params schema using Zod
const paramsSchema = z.object({
  id: z.string().nonempty('Report ID is required'),
});

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Get the session
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is a FACILITY user
  if (!session || session.user.role !== 'FACILITY') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Validate the report ID
  const parseResult = paramsSchema.safeParse(params);

  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.errors[0].message }, { status: 400 });
  }

  const { id } = parseResult.data;

  try {
    // Check if the report exists and belongs to the facility user (via patient)
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        patient: true,  // Including patient details to ensure proper authorization
      },
    });
    // @ts-ignore
    if (!report || report.patient.facilityId !== session.user.id) {
      return NextResponse.json({ message: 'Report not found or unauthorized' }, { status: 404 });
    }

    // Delete the report
    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Report deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
