import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { sendPdfEmail } from '@/app/helpers/pdfEmailSender';
import prisma from '@/prisma'; // Adjust the import path as needed

export async function POST(req: Request) {
  const { reportId, pdf, reportTitle } = await req.json();

  if (!reportId || !pdf || !reportTitle) {
    return NextResponse.json({ message: 'Report ID, PDF, and report title are required' }, { status: 400 });
  }

  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized: No session found' }, { status: 401 });
    }

    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json({ message: 'User email not found' }, { status: 400 });
    }

    // Convert base64 PDF to Buffer
    const pdfBuffer = Buffer.from(pdf, 'base64');

    // Send the email to the logged-in user's email
    const result = await sendPdfEmail(userEmail, pdfBuffer, reportTitle);

    if (result) {
      return NextResponse.json({ message: 'PDF sent successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to send PDF' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in send-pdf-email API route:', error);
    return NextResponse.json({ message: 'An error occurred while sending the PDF' }, { status: 500 });
  }
}