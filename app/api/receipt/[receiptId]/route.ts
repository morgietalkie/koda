import { NextResponse } from "next/server";
import { z } from "zod";

const receiptParamsSchema = z.object({
  receiptId: z.uuid()
});

const receiptSchema = z.object({
  receiptId: z.string(),
  contactName: z.string(),
  contactEmail: z.email(),
  isrc: z.string(),
  artistName: z.string(),
  originalLink: z.url(),
  reference: z.string(),
  receivedAt: z.string(),
});

export type ReceiptResponse = z.infer<typeof receiptSchema>;

type ReceiptResponseBody = ReceiptResponse | {
  error: string;
};

export async function GET(
  _: Request,
  context: { params: Promise<{ receiptId?: string }> }
): Promise<NextResponse<ReceiptResponseBody>> {
  const rawParams = await context.params;
  const parsedParams = receiptParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid receiptId" }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const receipt = {
    receiptId: "00000000-0000-4000-8000-000000000000",
    contactName: "Irene Hygum Pedersen",
    contactEmail: "irene@koda.dk",
    isrc: "GBAYE9601030",
    artistName: "The Beatles",
    originalLink: "https://example.com/original-work/123456",
    reference: "NMP-123456",
    receivedAt: new Date().toISOString(),
  };

  if (!receipt) {
    return NextResponse.json({ error: "Ingen registrering fundet for det angivne Receipt ID." }, { status: 404 });
  }

  const validatedReceipt = receiptSchema.safeParse(receipt);
  if (!validatedReceipt.success) {
    return NextResponse.json({ error: "Response payload validation failed" }, { status: 500 });
  }

  return NextResponse.json(validatedReceipt.data);
}
