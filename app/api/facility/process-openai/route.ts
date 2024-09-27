// app/api/process-openai/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/prisma";
import { OpenAI } from "openai";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/route";

const uploadLabResultSchema = z.object({
    patientId: z.string().nonempty('Patient ID is required'),
   
  });
// Define request body schema using Zod
const processOpenAISchema = z.object({
  labResults: z
    .array(
      z.object({
        id: z.string(),
        extractedText: z.string(),
      })
    )
    .min(1, "Lab results are required"),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "FACILITY") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parseResultID = uploadLabResultSchema.safeParse(body);

  // Validate request body
  const parseResult = processOpenAISchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { message: parseResult.error.errors[0].message },
      { status: 400 }
    );
  }

  const { labResults } = parseResult.data;
  // @ts-ignore
  const { patientId } = parseResultID.data;

  try {
    // Concatenate all extracted texts
    const allText = labResults
      .map((result) => result.extractedText)
      .join("\n\n");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Lab Results: ${allText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Corrected model name
      messages: [
        {
          role: "system",
          content: `Generate a comprehensive health analysis  and generate that in the following structured format.
            <h2> Report Overview </h2>
    <p> Date of Report: [Extract from report] </p>
    <p> Report Reference: [Extract from report] </p>

     Summary of Key Health Metrics
   Create a table with the following columns:
   | Metric | Value | Standard Range | Interpretation |
   Include every single metrics from the lab results and dont miss the single one.

Detailed Analysis & Recommendations:

  For each metric, provide a detailed explanation of what the value means for my health.

 Offer personalized dietary, lifestyle, and supplement recommendations. Please infuse recommended dietary changes and specific herbs that can be used to address specific health concerns based on widely available data that you can reference. Place a special focus on highly acclaimed Jamaican herbs. However, do not limit your herbal recommendations to Jamaican herbs only. If there are globally accepted herbal remedies that can be equally effective, you may recommend them also.

  Incorporate an Alkaline Whole Foods approach to healing the body in these recommendations.

   Suggest any further tests or follow-up actions that might be needed for each identified concern.

   Health Risk Assessment:

 Evaluate the risk levels for all possible chronic conditions such as diabetes, cardiovascular diseases, liver diseases, kidney diseases, and cancer based on the lab results.

      Tabular Insights:

  Include numerical spreadsheet charts, where practical for key metrics, particularly for cholesterol levels, glucose levels, kidney function, electrolytes balance, liver function, prostate health, inflammation levels, iron levels, and vitamin D levels, etc.

     Trends and Observations:

  Identify any trends in the data and their implications for the user's health.

      Probability of Dysfunction:

  Assess the probability of dysfunction in areas such as lipid panel, inflammation, acid-base balance, toxicity, heavy metals, and oxidative stress, etc.

      What to Ask Your Doctor on Your Next Visit:

  Provide a comprehensive list of specific, pointed questions I should ask my doctor based on the analysis of the lab results.

   Break down this section into subheads that identify each stated health concern, and produce a set of specific questions for the doctor, for each stated concern.

       Personalized Health Insights:

   Tailor a set of useful insights to the user's specific age, gender, and health status

       Lifestyle and Environmental Factors:

   Consider how lifestyle factors such as smoking, alcohol consumption, physical activity, and environmental exposures may impact the lab results and overall health, and make relevant recommendations towards more positive outcomes

  Genetic Predispositions:

  If genetic data is available or mentioned, include insights on how genetic predispositions might affect the lab results and health risks.

  Mental Health Indicators:

  Assess potential indicators of mental health conditions such as stress, anxiety, and depression from relevant biomarkers if present in the lab report.

   Immune System Function:

   Evaluate the status of the immune system through markers such as white blood cell count and specific immune-related proteins.
   Hydration Status:

   Analyze hydration levels using metrics like blood urea nitrogen (BUN) and electrolytes.

  Bone Health:
  Include metrics related to bone health such as calcium levels, vitamin D levels, and other relevant markers.

 Hormonal Balance:

   Evaluate hormonal levels, including thyroid function, sex hormones, and adrenal function if relevant data is provided.

   Gut Health:

Assess markers related to gut health and digestive function if stool tests or related data are available.

Possible Causes. For each health issue that is identified, you should add a paragraph that comprehensively outlines the possible causes of the issue, including eating habits, lifestyle, genetics etc.
Implications of Procrastination  For each health issue that is identified, you should add a paragraph that comprehensively outlines  the real implications that exist, should the patient fail to act on the results and recommendations provided.
 

 Ensure each section is thorough, wordy, clearly explained, and provides actionable insights and recommendations. Please ensure that each health report contains a subhead entitled, Conclusion, that outlines in summary detail, the primary areas of concern and the recommended actions towards addressing these concerns.

Ensure the output is formatted using HTML elements like <h1>, <h2>, <table>, <th>, <td>, <p>, <ul>, and <li>. Use the following CSS classes and design guidelines to ensure readability and visual appeal:
- Use a clean, modern font like "Roboto" or "Open Sans."
- Apply  soft borders to tables for better readability.
- Highlight recommendations 
- Include alternating row colors in tables for readability.
- Add padding and margins to create a minimalist layout with plenty of whitespace.




`,
        },
        { role: "user", content: prompt },
      ],
     
    });

    const reportContent = completion.choices[0].message?.content;

    if (!reportContent) {
      throw new Error("Failed to generate report");
    }

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient || patient.facilityId !== session.user.id) {
        return NextResponse.json({ message: 'Patient not found or unauthorized' }, { status: 404 });
      }

    // Create Report in DB
    const report = await prisma.report.create({
      data: {
        title: `Report for User ${patientId}`,
        content: reportContent,
        patient: {
            connect: { id: patientId },
          },
        user: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(
      { message: "Report generated successfully", report },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { message: "Failed to generate report" },
      { status: 500 }
    );
  }
}
