import { NextResponse } from "next/server";
import { isValidIsrc } from "@/utils/isValidISRC";

export type OriginalWork = {
  title: string;
  workNumber: string;
  composers: string[];
  arranger: string;
  lyricist: string;
};




export async function GET(_: Request, context: { params: Promise<{ isrc?: string }> }): Promise<NextResponse<OriginalWork | { error: string }>> {
  const { isrc } = await context.params;


  if (!isrc || !isValidIsrc(isrc)) {
    return NextResponse.json({ error: "Invalid ISRC format" }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  return NextResponse.json({
    title: "Yesterday",
    workNumber: "12341234",
    composers: ["Irene Hygum Pedersen", "Søren Stensby", "Israa Azzam"],
    arranger: "Irene Hygum Pedersen",
    lyricist: "Søren Stensby",
  });
}
