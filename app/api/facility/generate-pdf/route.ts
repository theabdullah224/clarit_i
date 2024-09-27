// app/api/generate-pdf/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/prisma';
import { z } from 'zod';

import puppeteer from 'puppeteer';
import { authOptions } from '../../auth/[...nextauth]/route';

const generatePdfSchema = z.object({
  reportId: z.string(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'FACILITY') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const parseResult = generatePdfSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { message: parseResult.error.errors[0].message },
      { status: 400 }
    );
  }

  const { reportId } = parseResult.data;

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report || report.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Report not found or unauthorized' },
        { status: 404 }
      );
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Set the content of the page to the report's HTML content
    await page.setContent(report.content, { waitUntil: 'networkidle0' });

    // Generate PDF from the page content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    // Convert buffer to base64
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

    return NextResponse.json({ pdf: base64Pdf }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ message: 'Failed to generate PDF' }, { status: 500 });
  }
}
