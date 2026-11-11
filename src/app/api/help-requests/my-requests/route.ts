import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/permissions";
import { listHelpRequestsByAuthor } from "@/services/help-request.service";
import { helpRequestFilterSchema } from "@/validators/help-request.schema";

export async function GET(request: Request) {
  try {
    const user = await requireStudent();
    const url = new URL(request.url);
    const parsed = helpRequestFilterSchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid search or pagination parameters." }, { status: 400 });
    }
    return NextResponse.json(await listHelpRequestsByAuthor(user.id, parsed.data));
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Insufficient permissions.") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Unable to retrieve your help requests." }, { status: 500 });
  }
}
