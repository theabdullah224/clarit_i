// app/api/facility/process-openai/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/prisma"; // Ensure this path is correct based on your project structure
import { OpenAI } from "openai";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";

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
  const user = await prisma.user.findUnique({
    where: { email: session?.user.email! },
    select: {
      name: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
    },
  });

  if (!session || session.user.role !== "USER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Validate request body
  const parseResult = processOpenAISchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { message: parseResult.error.errors[0].message },
      { status: 400 }
    );
  }

  const { labResults } = parseResult.data;


  // ---------------------------
  function parseLabReport(text) {
    // Helper function to extract data based on multiple possible patterns
    const extractField = (regexes) => {
      for (const regex of regexes) {
        const match = text.match(regex);
        if (match) return match[1].trim();
      }
      return "Not Availible";
    };
    const dateRegex = /\b(\d{1,2}[-\/\s]*[A-Za-z]{3,9}[-\/\s]*\d{2,4}(?:\s*\d{1,2}:\d{2}(?:[AP]M)?)?)\b/i;

    // Regular expressions for each field with different possible variations
    const nameRegexes = [
      /(Full Name|Patient Name|Client Name|Subject Name|Individual Name|Patient Full Name|Name of the Patient|First and Last Name|Complete Name|Personal Name|Identified Name|Client Full Name|Person Name|Beneficiary Name|Examinee Name|Patient Identification Name|Applicant Name|Case Name|Medical Record Name|Official Name|Patient Label|Registered Name|Reportee Name|Full Legal Name|Healthcare Recipient Name|Medical ID Name|Name of Client|Examination Name|Laboratory Subject Name|Investigation Name|Sample Recipient Name|Requestor Name|Citizen Name|Report Recipient Name|Individual Identifier|Treatment Recipient Name|Testee Name|Person Being Tested|Investigation Subject|Sample Provider Name|Person Under Investigation|Registered Patient Name|Full Identification Name|Healthcare Subject|Requesting Person|Beneficiary Identity|Test Subject Name|Health Recipient Name|Person of Interest|Specimen Owner):\s*(.*)/i,
      /Name:\s*(.*)/i,
      /Patient Name:\s*(.*)/i,
      /Full Name:\s*(.*)/i,
      /Name of Patient:\s*(.*)/i,
      /Client Name:\s*(.*)/i,
      /Receiver Name:\s*(.*)/i,
      /Recipient:\s*(.*)/i,
      /Name\s*:\s*(.*)/i,
      /Name\s*-\s*(.*)/i,
      /Name\s*\.\s*(.*)/i,
      /Customer:\s*(.*)/i,
      /Insured Name:\s*(.*)/i,
      /Test Subject:\s*(.*)/i,
      /User Name:\s*(.*)/i,
      /Patient:\s*(.*)/i,
      /Name:\s*(.*)/i,
      /Patient Name:\s*(.*)/i,
      /Name\s*-\s*(.*)/i,
      /Recipient:\s*(.*)/i,
      /Patient:\s*(.*)/i,
    ];

    const ageRegexes = [
      /(Patient Age|Client Age|Subject Age|Current Age|Age of Patient|Chronological Age|Recorded Age|Reported Age|Investigated Age|Age in Years|Years of Age|Age in Months|Biological Age|Applicant Age|Age at Testing|Date of Birth|Individual Age|Testee Age|Medical Age|Verified Age|Calculated Age|Years of Life|Life Years|Estimated Age|Self-Reported Age|Documented Age|Clinical Age|Age Detail|Exact Age|Birth Age|Identified Age|Recorded Age of Patient|Reportee Age|Examination Age|Legal Age|Test Age|Patient's Chronological Age|Registered Age|Age at Collection|Age of Individual|Examination Subject Age|Age Data|Age Recorded|Age in Record|Healthcare Age|Age Group|Sample Recipient Age|Age at Time of Test|Age Range):\s*(.*)/i,
      /Age:\s*(.*)/i,
      /Patient Age:\s*(.*)/i,
      /Years old:\s*(.*)/i,
      /Age\s*:\s*(.*)/i,
      /DOB\/Age:\s*(.*)/i,
      /Age\s*-\s*(.*)/i,
      /Date of Birth\/Age:\s*(.*)/i,
      /Birth Year:\s*(.*)/i,
      /Birth Date:\s*(.*)/i,
      /Age at Test:\s*(.*)/i,
      /Years:\s*(.*)/i,
      /Client Age:\s*(.*)/i,
      /Recipient Age:\s*(.*)/i,
      /User Age:\s*(.*)/i,
      /DOB:\s*(.*)/i,
      /Age\/Gender:\s*(\d+)\s*\/?\s*(\w+)/i, // Handles age + gender in one line
      /Age:\s*(\d+)/i,
      /Age\s*:\s*(.*)/i,
      /Years old:\s*(\d+)/i,
    ];

    const genderRegexes = [
      /(Sex|Gender Identity|Biological Sex|Male\/Female|Gender \(M\/F\)|Gender \(Male\/Female\/Other\)|Gender Assigned at Birth|Patient Gender|Reported Gender|Gender Type|Legal Gender|Sex Category|Medical Gender|Client Gender|Gender Classification|Registered Gender|Sex\/Gender|Examination Gender|Subject Gender|Gender Marker|Gender Details|Gender Code|Biological Gender|Male\/Female\/Non-Binary|Self-Reported Gender|Gender \(Male\/Female\/Unknown\)|Assigned Gender|Gender Designation|Verified Gender|Official Gender|Documented Gender|Sex Identity|Gender Notation|Person’s Gender|Health Gender|Sex of Patient|Gender \(Sex\)|Gender Data|Clinical Gender|Gender Label|Examination Subject Gender|Registered Sex|Healthcare Gender|Gender at Birth|Sample Recipient Gender|Sex Information|Gender in Records|Gender-Based Identification|Gender in Medical Records|Gender of Individual):\s*(.*)/i,
      /Gender:\s*(.*)/i,
      /Sex:\s*(.*)/i,
      /sex\s*(.*)/i,
      /sex:\s*(.*)/i,
      /Patient Gender:\s*(.*)/i,
      /Biological Sex:\s*(.*)/i,
      /Sex\s*:\s*(.*)/i,
      /Client Gender:\s*(.*)/i,
      /Recipient Sex:\s*(.*)/i,
      /Gender Identity:\s*(.*)/i,
      /Sexual Identity:\s*(.*)/i,
      /User Gender:\s*(.*)/i,
      /Biological Gender:\s*(.*)/i,
      /Sex:\s*(.*)/i,
      /Patient Sex:\s*(.*)/i,
      /Male\/Female:\s*(.*)/i,
      /Gender\s*:\s*(.*)/i,
      /Gender:\s*(.*)/i,
      /Sex:\s*(.*)/i,
      /Age\/Gender:\s*\d+\s*\/?\s*(\w+)/i,
    ];

    const sampleIdRegexes = [
      /(Specimen ID|Lab Sample ID|Test ID|Specimen Number|Sample Identifier|Test Specimen ID|Unique Sample ID|Lab Specimen Number|Investigation ID|Barcode Number|Collection ID|Sample Reference Number|Accession Number|Sample Tracking ID|Specimen Tracking Number|Lab Sample Number|Sample Code|Reference Specimen Number|Collected Sample ID|Test Request ID|Examination ID|Medical Sample ID|Report Number|Specimen Code|Unique Specimen Identifier|Lab Reference Number|Case Number|Collected Specimen ID|Test Identifier|Sample Receipt ID|Laboratory Reference ID|Identification Code|Specimen Collection Number|Sample Registration Number|Test Reference Number|Investigation Sample ID|Lab Test Code|Specimen Barcode|Laboratory Test ID|Lab Identifier|Sample Label|Clinical Specimen Number|Tracking ID for Sample|Diagnostic Sample ID|Specimen Label|Collection Reference Number|Sample Registration ID|Specimen Receipt ID|Specimen Reference Code):\s*(.*)/i,
      /Sample ID:\s*(.*)/i,
      /No:\s*(.*)/i,
      /no:\s*(.*)/i,
      /Specimen ID:\s*(.*)/i,
      /ID Number:\s*(.*)/i,
      /Accession Number:\s*(.*)/i,
      /Barcode Number:\s*(.*)/i,
      /Sample Code:\s*(.*)/i,
      /Collection ID:\s*(.*)/i,
      /Sample Identifier:\s*(.*)/i,
      /Reference Number:\s*(.*)/i,
      /Patient ID:\s*(.*)/i,
      /Case ID:\s*(.*)/i,
      /Lab ID:\s*(.*)/i,
      /Test Number:\s*(.*)/i,
      /Order Number:\s*(.*)/i,
      /Report ID:\s*(.*)/i,
      /Sample ID:\s*(.*)/i,
      /ID Number:\s*(.*)/i,
      /Specimen ID:\s*(.*)/i,
    ];

    const dateCollectedRegexes = [
      /(Collection Date|Specimen Collection Date|Sample Collection Date|Date of Sample|Date of Specimen Collection|Collected On|Date of Collection|Collection Time|Date\/Time of Collection|Date Sample Collected|Specimen Collected On|Sample Taken On|Collection Date\/Time|Date Sample Received|Date and Time Collected|Date Sample Was Taken|Collection Timestamp|Date of Taking Sample|Specimen Taken On|Date of Sample Collection|Date\/Time Sample Collected|Collected Date|Date Collected Specimen|Time of Sample Collection|Date Test Sample Collected|Specimen Retrieval Date|Collection Date-Time|Date of Collection Event|Collection Information|Date of Laboratory Collection|Sample Acquisition Date|Date and Time of Sample|Collection Event Time|Date Collected Test|Time Collected Sample|Date Time Sample Taken|Collection Moment|Collection Event Date|Date of Specimen Gathering|Collection Occurrence|Timestamp of Collection|Date of Gathering|Collection Report Time|Sample Event Date|Date Taken|Date Captured|Specimen Date|Sample Timing|Collection of Sample Date):\s*(.*)/i,
      /Date Collected:\s*(.*)/i,
      /Order Date:\s*(.*)/i,
      /Collection Date:\s*(.*)/i,
      /Sample Collection Date:\s*(.*)/i,
      /Date of Collection:\s*(.*)/i,
      /Collection Time:\s*(.*)/i,
      /Date and Time Collected:\s*(.*)/i,
      /Specimen Collection Date:\s*(.*)/i,
      /Date Sample Taken:\s*(.*)/i,
      /Date Drawn:\s*(.*)/i,
      /Date Sample Collected:\s*(.*)/i,
      /Date & Time of Collection:\s*(.*)/i,
      /Draw Date:\s*(.*)/i,
      /Collected On:\s*(.*)/i,
      /Collection Date and Time:\s*(.*)/i,
      /Sample Drawn:\s*(.*)/i,
      /Date Collected:\s*(.*)/i,
      /Collection Date:\s*(.*)/i,
      dateRegex,
    ];

    const doctorRegexes = [
      /(Ordering Physician|Referring Doctor|Attending Physician|Medical Practitioner|Physician Name|Consultant Name|Doctor’s Name|Healthcare Provider|Responsible Physician|Test Ordered By|Treating Physician|Referring Clinician|Doctor on Duty|Consulting Doctor|Doctor in Charge|Test Ordered By|Primary Care Physician|Healthcare Professional|Test Requested By|Consultant in Charge|Medical Officer|Test Physician|Doctor Requesting Test|Requesting Physician|Treating Doctor|Referring Doctor|Physician Attending|Medical Consultant|Healthcare Professional|Medical Doctor|Referring Physician|Attending Doctor|Test Requestor|Test Supervisor):\s*(.*)/i,
      /Doctor:\s*(.*)/i,
      /By:\s*(.*)/i,
      /Referring Physician:\s*(.*)/i,
      /Consultant:\s*(.*)/i,
      /Attending Doctor:\s*(.*)/i,
      /Physician:\s*(.*)/i,
      /Doctor in Charge:\s*(.*)/i,
      /Doctor Name:\s*(.*)/i,
      /Referring Doctor:\s*(.*)/i,
      /Medical Consultant:\s*(.*)/i,
      /Consulting Doctor:\s*(.*)/i,
      /Attending Physician:\s*(.*)/i,
      /Reviewed by:\s*(.*)/i,
      /Authorized by:\s*(.*)/i,
      /Test Ordered by:\s*(.*)/i,
      /Referred by:\s*(.*)/i,
    ];

    const dateOfReportRegexes = [
      /Date of Report:\s*(.*)/i,
      /Report Date:\s*(.*)/i,
      /Test Report Date:\s*(.*)/i,
      /Result Date:\s*(.*)/i,
      /Date of Result:\s*(.*)/i,
      /Completion Date:\s*(.*)/i,
      /Report Issued:\s*(.*)/i,
      /Date Issued:\s*(.*)/i,
      /Date Reported:\s*(.*)/i,
      /Test Completed On:\s*(.*)/i,
      /Date of Result Issued:\s*(.*)/i,
      /Date Finalized:\s*(.*)/i,
      /Report Generated On:\s*(.*)/i,
      /Results Available:\s*(.*)/i,
      /Issued On:\s*(.*)/i,
      /Visit Date:\s*(.*)/i,
      /Date of Visit:\s*(.*)/i,
      dateRegex,
    ];

    // Extract the required fields using multiple patterns
    return {
      name: extractField(nameRegexes),
      age: extractField(ageRegexes),
      gender: extractField(genderRegexes),
      sampleId: extractField(sampleIdRegexes),
      dateCollected: extractField(dateCollectedRegexes),
      doctor: extractField(doctorRegexes),
      dateOfReport: extractField(dateOfReportRegexes),
    };
  }




  // ---------------------------












  try {
    // Concatenate all extracted texts
    const allText = labResults
      .map((result) => result.extractedText)
      .join("\n\n");
    const { name, age, gender, sampleId, dateCollected, doctor, dateOfReport } = parseLabReport(allText);
    console.log(allText)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let systemprompt;


    if (user?.subscriptionStatus === 'active') {
      systemprompt = `
       Ensure the output is formatted using HTML elements like <h1>, <h2>, <table>, <th>, <td>, <p>, <ul>, and <li>. Use the following CSS classes and design guidelines to ensure readability and visual appeal:
- Use a clean, modern font like "Roboto" or "Open Sans."
- Apply  soft borders to tables for better readability.
- Highlight recommendations 
- Include alternating row colors in tables for readability.
- Add padding and margins to create a minimalist layout with plenty of whitespace.
       
       Generate a comprehensive health analysis  and generate that in the following structured format.
       <h1>Health Analysis Summary</h1>
            <h2> Report Overview </h2>
    <p> Date of Report:${Date.now()} </p>


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






`
    } else {
      systemprompt = `Generate a basic summary report for the lab result and dont include any metrices from lab results in 6 to 7 lines. Ensure the output is formatted using HTML elements <p> 
                        Use the following CSS classes and design guidelines to ensure readability and visual appeal:
                        - Use a clean, modern font like "Roboto" or "Open Sans."
                        - Apply  soft borders to tables for better readability.
                        
                        
                        - Add padding and margins to create a minimalist layout with plenty of whitespace.
                        Additional Paragraph: After every report, include the following paragraph:
                       <p> Upgrade today for a Comprehensive Health Report
The information provided in this summary offers a basic overview of your health status based on the uploaded lab results. For a more detailed, personalized analysis and a comprehensive report on your health, including actionable insights and recommendations tailored to your needs, upgrade to our COMPREHENSIVE INSIGHTS plan. Unlock access to a full breakdown of your results, trends over time, and advanced features designed to empower you on your health journey.</p>
`
    }

    const prompt = `Lab Results: ${allText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Corrected model name
      messages: [
        {
          role: "system",
          content: `
       Ensure the output is formatted using HTML elements like <h1>, <h2>, <table>, <th>, <td>, <p>, <ul>, and <li>. Use the following CSS classes and design guidelines to ensure readability and visual appeal:
- Use a clean, modern font like "Roboto" or "Open Sans."
- Apply  soft borders to tables for better readability.
- Highlight recommendations 
- Include alternating row colors in tables for readability.
- Add padding and margins to create a minimalist layout with plenty of whitespace.
       
       Generate a comprehensive health analysis  and generate that in the following structured format.
       <h1><b>Comprehensive health analysis report </b></h1>
        <div>
        <b>  Patient Information:</b>
        <ul>
            <li>&nbsp;&nbsp;&nbsp;<b>Name:&nbsp;</b>${name} </li>
            <li>&nbsp;&nbsp;&nbsp;<b>Age:&nbsp;</b>${age} </li>
            <li>&nbsp;&nbsp;&nbsp;<b>Gender:&nbsp;</b>${gender} </li>
            <li>&nbsp;&nbsp;&nbsp;<b>Sample ID:&nbsp;</b> ${sampleId}</li>
            <li>&nbsp;&nbsp;&nbsp;<b>Date Collected:&nbsp;</b>${dateCollected} </li>
            <li>&nbsp;&nbsp;&nbsp;<b>Doctor:&nbsp;</b>${doctor} </li>
            <li>&nbsp;&nbsp;&nbsp;<b>Date of Report:&nbsp;</b> ${new Date().getDate().toString().padStart(2, '0')}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()} (${new Date().getHours() % 12 || 12}:${new Date().getMinutes().toString().padStart(2, '0')} ${new Date().getHours() >= 12 ? 'PM' : 'AM'})</li>
        </ul>
    </div>
            <h1>Health Analysis Summary</h1>
            

    <h2> Summary of Key Health Metrics</h2>
  <table >
  <thead>
    <tr >
      <th>Metric</th>
      <th>Value</th>
      <th>Standard Range</th>
      <th>Interpretation</th>
    </tr>
  </thead>
  <tbody>
    <tr >
      <td >Metric 1 (if unavailable, write "Not Available")</td>
      <td >Value 1 (if unavailable, write "Not Available")</td>
      <td >Standard Range 1 (if unavailable, write "Not Available")</td>
      <td >Interpretation 1 (if unavailable, write "Not Available")</td>
    </tr>
    <tr>
      <td >Metric 2 (if unavailable, write "Not Available")</td>
      <td >Value 2 (if unavailable, write "Not Available")</td>
      <td >Standard Range 2 (if unavailable, write "Not Available")</td>
      <td >Interpretation 2 (if unavailable, write "Not Available")</td>
    </tr>
  
    <tr >
      <td >Metric N (if unavailable, write "Not Available")</td>
      <td >Value N (if unavailable, write "Not Available")</td>
      <td >Standard Range N (if unavailable, write "Not Available")</td>
      <td >Interpretation N (if unavailable, write "Not Available")</td>
    </tr>
  </tbody>
</table>
   Include every single metrics from the lab results and dont miss the single one.

 <h2> Detailed Analysis & Recommendations:</h2>
    
  For each metric, provide a detailed  in-depth explanation of what the value means for my health .
  must add minimum 50 lines.

 Offer personalized dietary, lifestyle, and supplement recommendations. Please infuse recommended dietary changes and specific herbs that can be used to address specific health concerns based on widely available data that you can reference. Place a special focus on highly acclaimed Jamaican herbs. However, do not limit your herbal recommendations to Jamaican herbs only. If there are globally accepted herbal remedies that can be equally effective, you may recommend them also.

  Incorporate an Alkaline Whole Foods approach to healing the body in these recommendations.

   Suggest any further tests or follow-up actions that might be needed for each identified concern.

   <h2> Health Risk Assessment:</h2>

 Evaluate the risk levels for all possible chronic conditions such as diabetes, cardiovascular diseases, liver diseases, kidney diseases, and cancer based on the lab results.
 must add minimum 50 lines.

      <h2>Tabular Insights:</h2>

  Include numerical spreadsheet charts, where practical for key metrics, particularly for cholesterol levels, glucose levels, kidney function, electrolytes balance, liver function, prostate health, inflammation levels, iron levels, and vitamin D levels, etc.
          
    <h2> Trends and Observations:</h2>

  Identify any trends in the data and their implications for the user's health.
  must add minimum 50 lines.

    <h2>  Probability of Dysfunction:</h2>

  Assess the probability of dysfunction in areas such as lipid panel, inflammation, acid-base balance, toxicity, heavy metals, and oxidative stress, etc.
  must add minimum 50 lines.

    <h2>  What to Ask Your Doctor on Your Next Visit:</h2>

  Provide a comprehensive list of specific, pointed questions I should ask my doctor based on the analysis of the lab results((minimum questions)).

   Break down this section into subheads that identify each stated health concern, and produce a set of specific questions for the doctor, for each stated concern.

     <h2>  Personalized Health Insights:</h2>

   Tailor a set of useful insights to the user's specific age, gender, and health status.
   must add minimum 50 lines

      <h2> Lifestyle and Environmental Factors:</h2>

   Consider how lifestyle factors such as smoking, alcohol consumption, physical activity, and environmental exposures may impact the lab results and overall health, and make relevant recommendations towards more positive outcomes.
   must add minimum 50 lines

 <h2> Genetic Predispositions:</h2>

  If genetic data is available or mentioned, include insights on how genetic predispositions might affect the lab results and health risks.
  must add minimum 50 lines.

 <h2> Mental Health Indicators:</h2>

  Assess potential indicators of mental health conditions such as stress, anxiety, and depression from relevant biomarkers if present in the lab report.
  must add minimum 50 lines.

 <h2>  Immune System Function:</h2>

   Evaluate the status of the immune system through markers such as white blood cell count and specific immune-related proteins.
   must add minimum 50 lines.
 <h2>  Hydration Status:</h2>

   Analyze hydration levels using metrics like blood urea nitrogen (BUN) and electrolytes.

<h2>  Bone Health:</h2>
  Include metrics related to bone health such as calcium levels, vitamin D levels, and other relevant markers.
  must add minimum 50 lines.

 <h2>Hormonal Balance:</h2>

   Evaluate hormonal levels, including thyroid function, sex hormones, and adrenal function if relevant data is provided.
   must add minimum 50 lines.

  <h2> Gut Health:</h2>

Assess markers related to gut health and digestive function if stool tests or related data are available.
must add minimum 50 lines.

Possible Causes. For each health issue that is identified, you should add a paragraph that comprehensively outlines the possible causes of the issue, including eating habits, lifestyle, genetics etc.
Implications of Procrastination  For each health issue that is identified, you should add a paragraph that comprehensively outlines  the real implications that exist, should the patient fail to act on the results and recommendations provided.
 

 1.Ensure each section is thorough, wordy, clearly explained, and provides actionable insights and recommendations. Please ensure that each health report contains a subhead entitled, Conclusion, that outlines in summary detail, the primary areas of concern and the recommended actions towards addressing these concerns.
 2.Never include this type of any message :"This HTML code generates a structured health analysis report for a null patient, addressing all elementsspecified in the request while ensuring clarity and modern design."
3.All the text should be black never include any other colors
4.make sure all the sections are deeply explained make sure you give maximum response





`,
        },
        { role: "user", content: prompt },
      ],
        
    });

    const reportContent = completion.choices[0].message?.content;


    if (!reportContent) {
      throw new Error("Failed to generate report");
    }

    // Create Report in DB
    const report = await prisma.report.create({
      data: {
        title: `Health Report - ${new Date().toLocaleDateString()}`,
        content: reportContent,
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
