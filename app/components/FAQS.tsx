'use client';

import React, { useState } from 'react';
import { ChevronDownIcon ,Plus} from 'lucide-react';

type FAQItem = {
  question: string;
  answer?: string;
};

type FAQProps = {
  faqs?: FAQItem[];
};

const Page: React.FC<FAQProps> = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Default FAQ items if none are provided
  const defaultFaqs: FAQItem[] = [
    {
      question: "How does Clariti analyze and interpret my lab test results?",
      answer: "Our Machine Learning technology analyzes your lab results by comparing your data against standard reference ranges. It examines each health marker in detail and generates a comprehensive report that provides clear, understandable insights into your health indicators. The analysis aims to help you make informed decisions about your health."
    },
    {
      question: "What should I do if I don't understand my report?",
      answer: "If you find any part of your report confusing, you can reach out to our support team for assistance. Additionally, we recommend discussing the report with a healthcare professional who can provide further explanation and advice based on your individual health needs."
    },
    {
      question: "Is this analysis considered a medical diagnosis?",
      answer: "No, our analysis is intended to offer insights into your health trends and markers, but it does not replace a medical diagnosis or treatment plan. For any medical concerns or conditions, it is crucial to consult with a qualified healthcare provider who can offer personalized medical advice and treatment."
    },
    {
      question: "What steps should I take after receiving my analysis report?",
      answer: "After reviewing your report, we suggest discussing it with a healthcare professional, especially if any of the markers are outside the standard ranges. Follow any recommended actions, such as lifestyle changes or further tests, and schedule regular health check-ups as advised. Our platform also allows you to share the report digitally with your doctor for further consultation."
    },
    {
      question: "How is my health data protected?",
      answer: "CLARITI Health Insights supports a wide range of lab tests, including blood tests, urine tests, stool tests, Pap smears, semen analyses, and swab tests. Our platform can analyze these results to provide you with detailed health insights and recommendations."
    },
    {
      question: "What types of lab tests can I analyze on this platform?",
      answer: "CLARITI Health Insights supports a wide range of lab tests, including blood tests, urine tests, stool tests, Pap smears, semen analyses, and swab tests. Our platform can analyze these results to provide you with detailed health insights and recommendations."
    },
    {
      question: "How quickly will I receive my analysis report?",
      answer: "Once you upload your lab results, our system typically processes the data and generates your analysis report within a few seconds. You will receive a notification via email as soon as your report is ready for review on the platform."
    },
    {
      question: "Can I share my analysis report with my doctor?",
      answer: "Yes, you can easily share your analysis report with your doctor or healthcare provider. Our platform includes a feature that allows you to send the report digitally with just a few clicks, ensuring that your healthcare provider can review your results quickly and efficiently."
    },
    {
      question: "Is there a cost to use CLARITI Health Insights?",
      answer: "CLARITI offers different subscription plans depending on your needs. We provide a free Basic Snapshot that gives you a customized health summary. For more detailed insights, you can choose from our paid plans, which offer comprehensive analysis and personalized recommendations."
    },
    {
      question: "What if I have more questions?",
      answer: "If you have any additional questions or need further assistance, please don't hesitate to contact us. You can reach out to our support team via the Contact Us form on our website, and we will be happy to help."
    },
   
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <main className="min-h-screen">
        <div className='flex items-center justify-center  '>

      <h2 className="text-5xl font-bold mx-auto">FAQs</h2>
        </div>
      <div className="w-full max-w-[50%] mx-auto  py-8   my-6 px-4 md:px-6 lg:px-8    bg-white ">
        
        <div className="space-y-4">
          {displayFaqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                className="flex justify-between items-center w-full text-left py-4"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                <Plus 
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && faq.answer && (
                <div className="pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Page;