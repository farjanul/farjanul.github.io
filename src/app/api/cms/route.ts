export const dynamic = "force-static";
import { NextResponse } from "next/server";
import { getContentGroups } from "../../actions";

export async function GET() {
  try {
    const contentGroups = await getContentGroups();
    return NextResponse.json({ contentGroups });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
