import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/permissions";
import { createHelpRequest, listHelpRequests } from "@/services/help-request.service";
import { createHelpRequestSchema, helpRequestFilterSchema } from "@/validators/help-request.schema";

function authError(error: unknown) {
  if (error instanceof Error && error.message === "Authentication required.") {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof Error && error.message === "Insufficient permissions.") {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = helpRequestFilterSchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid search or pagination parameters." }, { status: 400 });
    }
    return NextResponse.json(await listHelpRequests(parsed.data));
  } catch (error) {
    return authError(error) ?? NextResponse.json({ error: "Unable to retrieve help requests." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireStudent();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    const parsed = createHelpRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid help request data." }, { status: 400 });
    }
    const helpRequest = await createHelpRequest(user.id, parsed.data);
    return NextResponse.json({ helpRequest }, { status: 201 });
  } catch (error) {
    return authError(error) ?? NextResponse.json({ error: "Unable to create help request." }, { status: 500 });
  }
}
