// app/api/facility/send-patient-email/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/prisma';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]';
import { sendPdfEmail } from '@/app/helpers/pdfEmailSender';

const sendPatientEmailSchema = z.object({
  reportId: z.string().min(1, 'Invalid report ID'),  // Removed .uuid() validation
  pdf: z.string().min(1, 'PDF content is required'),
  reportTitle: z.string().min(1, 'Report title is required'),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'FACILITY') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Request body:", body);  // Log the body for debugging

    const parseResult = sendPatientEmailSchema.safeParse(body);
    console.log("Validation result:", parseResult);  // Log validation result

    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map(err => err.message).join(', ');
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    const { reportId, pdf, reportTitle } = parseResult.data;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { patient: true },
    });

    if (!report) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }
    // @ts-ignore
    if (report.patient.facilityId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized to send email for this report' }, { status: 403 });
    }

    const pdfBuffer = Buffer.from(pdf, 'base64');
    // @ts-ignore
    const emailResult = await sendPdfEmail(report.patient.email, pdfBuffer, reportTitle);

    if (emailResult) {
      return NextResponse.json({ message: 'PDF sent successfully to patient' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to send PDF to patient' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending patient email:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
