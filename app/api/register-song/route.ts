import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidIsrc } from "@/utils/isValidISRC";

const registrationRequestSchema = z.object({
  contactName: z.string(),
  contactEmail: z.email(),
  isrc: z
    .string()
    .refine((value) => isValidIsrc(value), { message: "Invalid ISRC format" }),
  artistName: z.string(),
  originalLink: z.string().optional(),
});

const submissionResponseSchema = z.object({
  reference: z.string(),
  receivedAt: z.string(),
  receiptId: z.uuid(),
});



export type RegistrationRequest = z.infer<typeof registrationRequestSchema>;
export type SubmissionResponse = z.infer<typeof submissionResponseSchema>;

type SubmissionResponseBody = SubmissionResponse | { error: string; };

export async function POST(request: Request): Promise<NextResponse<SubmissionResponseBody>> {
  const payload = await request.json();
  const parsedPayload = registrationRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    console.log(parsedPayload)
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const response = {
    reference: `NMP-${randomSuffix}`,
    receivedAt: new Date().toISOString(),
    receiptId: crypto.randomUUID(),
  };

  const validatedResponse = submissionResponseSchema.safeParse(response);
  if (!validatedResponse.success) {
    return NextResponse.json({ error: "Response payload validation failed" }, { status: 500 });
  }

  return NextResponse.json(validatedResponse.data);
}
