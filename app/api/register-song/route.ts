import { isValidIsrc } from "@/utils/isValidISRC";
import { NextResponse } from "next/server";


export type RegistrationRequest = {
  contactName: string;
  contactEmail: string;
  isrc: string;
  artistName: string;
  originalLink: string;
};


export type SubmissionResponse = {
  reference: string;
  receivedAt: string;
  receiptId: string;
};


export async function POST(request: Request) {
  const payload = (await request.json());

  if (!isValidIsrc(payload.isrc)) {
    return NextResponse.json(
      { error: "Invalid ISRC format" },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const response: SubmissionResponse = {
    reference: `NMP-${randomSuffix}`,
    receivedAt: new Date().toISOString(),
    receiptId: crypto.randomUUID(),
  };

  return NextResponse.json(response);
}
