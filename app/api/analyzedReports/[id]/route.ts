import prisma from "@/prisma/index";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // @ts-ignore
    const analyzedResult = await prisma.analyzedResult.findUnique({
      where: { id: params.id },
    });
    if (!analyzedResult) return NextResponse.json({}, { status: 404 });
    // @ts-ignore
    await prisma.analyzedResult.delete({ where: { id: params.id } });

    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
