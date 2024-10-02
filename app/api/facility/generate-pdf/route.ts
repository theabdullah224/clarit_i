
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/prisma';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

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

    // Read and encode the logo as Base64
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = logoBuffer.toString('base64');

    // Create the full HTML with the logo embedded
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report</title>
        <style>
          body { font-family: Arial, sans-serif; color: black; }
        body main{
            margin-top: 40px; 
            margin-bottom: 40px;
            
        }
          header {   color:black; }
          header img { height: 80px;   }
           main div{
        border-bottom: 1px solid black;
        
        color:black;
    }
        </style>
      </head>
      <body>
        <header>
          <img src="data:image/png;base64,${logoBase64}" alt="Logo" />
          
         
        </header>
        <main>
          
          ${report.content.replace(/```html|```/g, "").trim()}

          <h2>Disclaimer:</h2>
          <p>This report has been generated by a proprietary AI Health Analysis tool (LLM) and is intended for informational purposes only. It is not designed to diagnose, treat, or replace the expertise and care of a licensed medical professional. Please consult your healthcare provider for personalized medical advice based on your specific health needs.</p>
        </main>
      </body>
      </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Set the content of the page to the HTML with the embedded logo
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF from the page content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: false,
      margin: {
        top: '10mm',   // Set your desired top margin
        bottom: '10mm', // Set your desired bottom margin
        left:'10mm',
        right:'10mm'
      }
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
