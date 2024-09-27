"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaDownload } from "react-icons/fa";
import Link from "next/link";

const DownloadPDF = ({ analyzedresult }: { analyzedresult: any }) => {
  const pdfContentRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadPDF = async () => {
    if (pdfContentRef.current) {
      const clonedNode = pdfContentRef.current.cloneNode(true) as HTMLElement;

      const icon = new Image();
      icon.src = "/icon.png";
      icon.style.width = "50px";
      icon.style.marginBottom = "10px";
      icon.style.margin = "auto";
      clonedNode.insertBefore(icon, clonedNode.firstChild);

      clonedNode.style.backgroundColor = "white";
      clonedNode.style.color = "black";
      clonedNode.style.padding = "20px";
      clonedNode.style.margin = "20px";
      clonedNode.style.width = "650px";
      clonedNode.style.border = "1px solid #ccc";
      clonedNode.style.borderRadius = "4px";

      const title = clonedNode.querySelector("h1");
      if (title) {
        title.style.fontSize = "20px";
      }
      const contentDiv = clonedNode.querySelector("div");
      if (contentDiv) {
        contentDiv.style.fontSize = "14px";
      }

      document.body.appendChild(clonedNode);

      const canvas = await html2canvas(clonedNode, {
        backgroundColor: "white",
      });

      document.body.removeChild(clonedNode);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");

      const imgWidth = 595.28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 841.89;
        position -= 841.89;
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }

      pdf.save(`Report`);
    }
  };

  const structureContent = (content: string) => {
    const sections = [
      { title: "Report Overview", regex: /\*\*Report Overview\*\*/ },
      { title: "Summary of Key Health Metrics", regex: /\*\*Summary of Key Health Metrics\*\*/ },
      { title: "Detailed Analysis & Recommendations", regex: /\*\*Detailed Analysis & Recommendations\*\*/ },
      { title: "Health Risk Assessment", regex: /\*\*Health Risk Assessment\*\*/ },
      { title: "What to Ask Your Doctor on Your Next Visit", regex: /\*\*What to Ask Your Doctor on Your Next Visit\*\*/ },
      { title: "Personalized Health Insights", regex: /\*\*Personalized Health Insights\*\*/ },
      { title: "Lifestyle and Environmental Factors", regex: /\*\*Lifestyle and Environmental Factors\*\*/ },
      { title: "Implications of Procrastination", regex: /\*\*Implications of Procrastination\*\*/ },
      { title: "Conclusion", regex: /\*\*Conclusion\*\*/ },
    ];
  
    let structuredContent = content;
    sections.forEach(section => {
      structuredContent = structuredContent.replace(section.regex, `<h2 class="text-xl font-bold mt-4 mb-2">${section.title}</h2>`);
    });
  
    const metricsRegex = /\*\*Summary of Key Health Metrics\*\*([\s\S]*?)\*\*Detailed Analysis/;
    const metricsMatch = structuredContent.match(metricsRegex);
    if (metricsMatch) {
      const metricsTable = metricsMatch[1].trim().split('|').map(cell => cell.trim()).filter(cell => cell);
      const tableHTML = `
        <table class="w-full border-collapse border border-gray-300 mt-2 mb-4">
          <thead>
            <tr>
              ${metricsTable.slice(0, 5).map(header => `<th class="border border-gray-300 p-2">${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${metricsTable.slice(5).reduce<string[][]>((rows, cell, index) => {
              if (index % 5 === 0) rows.push([]);
              rows[rows.length - 1].push(cell);
              return rows;
            }, []).map(row => `
              <tr>
                ${row.map(cell => `<td class="border border-gray-300 p-2">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      structuredContent = structuredContent.replace(metricsRegex, `<h2 class="text-xl font-bold mt-4 mb-2">Summary of Key Health Metrics</h2>${tableHTML}**Detailed Analysis`);
    }
  
    return structuredContent;
  };

  return (
    <div className="my-4">
      <div className="border border-gray-200 p-2 my-4 rounded-md" ref={pdfContentRef}>
        <div className="flex justify-between items-center mb-20">
          <div className="flex-1"></div>
          <h1 className="text-center text-3xl mt-14 font-semibold flex-1">Report</h1>
          <div className="flex-1 flex justify-end">
            <Link href="/" className="z-40 mt-10 mr-10">
              <img src="/logo.png" className="w-30 sm:w-40 2xl:w-44" alt="Clariti Logo" />
            </Link>
          </div>
        </div>
        <div className="px-6" dangerouslySetInnerHTML={{ __html: structureContent(analyzedresult.content) }} />
      </div>
      <button
        className="p-2 flex mt-10 items-center gap-2 bg-blue-500 text-white rounded"
        onClick={handleDownloadPDF}
      >
        <FaDownload /> 
        Download PDF
      </button>
    </div>
  );
};

export default DownloadPDF;