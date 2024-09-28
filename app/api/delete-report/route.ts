import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  const { reportId } = await req.json(); // Get the report ID from the request body

  try {
    await prisma.$connect(); // Connect to the database

    // Attempt to delete the report
    const deletedReport = await prisma.report.delete({
      where: { id: reportId },
    });

    // If deletion is successful, return a success response
    return NextResponse.json({ message: "Report deleted successfully", deletedReport });
  } catch (error) {
    // Check if the error is due to a record not being found
    // @ts-ignore
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    
    // Log the error for debugging
    console.error("Error deleting report:", error);

    // Return a server error response for other types of errors
    return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Always disconnect after the operation
  }
};
