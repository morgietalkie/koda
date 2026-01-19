import { NextResponse } from "next/server";
import { isValidUID } from "@/utils/isValidUID";

export type ReceiptResponse = {
  contactName: string;
  contactEmail: string;
  isrc: string;
  artistName: string;
  originalLink: string;
  reference: string;
  receivedAt: string;
  receiptId: string;
};



export async function GET(_: Request, context: { params: Promise<{ receiptId?: string }> }): Promise<NextResponse<ReceiptResponse> | NextResponse<{ error: string }>> {
  const { receiptId } = await context.params;

  await new Promise((resolve) => setTimeout(resolve, 1200));


  if (!receiptId) {
    return NextResponse.json({ error: "Receipt ID mangler i forespørgslen." }, { status: 400 });
  }

  if (!isValidUID(receiptId)) {
    return NextResponse.json({ error: "Receipt ID er ugyldigt." }, { status: 400 });
  }

  const receipt = {
    receiptId: "00000000-0000-4000-8000-000000000000",
    contactName: "Irene Hygum Pedersen",
    contactEmail: "irene@koda.dk",
    isrc: "GBAYE9601030",
    artistName: "The Beatles",
    originalLink: "https://example.com/original-work/123456",
    reference: "NMP-123456",
    receivedAt: new Date().toISOString(),
  }


  if (!receipt) {
    return NextResponse.json({ error: "Ingen registrering fundet for det angivne Receipt ID." }, { status: 404 });
  }

  return NextResponse.json(receipt);
}
