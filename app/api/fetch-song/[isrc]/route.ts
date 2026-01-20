import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidIsrc } from "@/utils/isValidISRC";

const fetchSongParamsSchema = z.object({
  isrc: z
    .string()
    .refine((value) => isValidIsrc(value), { message: "Invalid ISRC format" }),
});

const originalWorkSchema = z.object({
  title: z.string(),
  workNumber: z.string(),
  composers: z.array(z.string()),
  arranger: z.string(),
  lyricist: z.string(),
});

export type OriginalWork = z.infer<typeof originalWorkSchema>;

type FetchSongResponseBody = OriginalWork | { error: string; };

export async function GET(
  _: Request,
  context: { params: Promise<{ isrc?: string }> }
): Promise<NextResponse<FetchSongResponseBody>> {
  const rawParams = await context.params;
  const parsedParams = fetchSongParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid ISRC format" }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const responsePayload = originalWorkSchema.safeParse({
    title: "Yesterday",
    workNumber: "12341234",
    composers: ["Irene Hygum Pedersen", "Søren Stensby", "Israa Azzam"],
    arranger: "Irene Hygum Pedersen",
    lyricist: "Søren Stensby",
  });

  if (!responsePayload.success) {
    return NextResponse.json({ error: "Response payload validation failed" }, { status: 500 });
  }

  return NextResponse.json(responsePayload.data);
}
