import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/permissions";
import { getHelpRequestById, updateHelpRequest } from "@/services/help-request.service";
import { updateHelpRequestSchema } from "@/validators/help-request.schema";

const uuidSchema = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function authError(error: unknown) {
  if (error instanceof Error && error.message === "Authentication required.") {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof Error && error.message === "Insufficient permissions.") {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return null;
}

async function getId(context: { params: Promise<{ id: string }> }) {
  return (await context.params).id;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const id = await getId(context);
  if (!uuidSchema.test(id)) return NextResponse.json({ error: "Invalid request ID." }, { status: 400 });
  try {
    const helpRequest = await getHelpRequestById(id);
    if (!helpRequest) return NextResponse.json({ error: "Help request not found." }, { status: 404 });
    return NextResponse.json({ helpRequest });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve help request." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = await getId(context);
  if (!uuidSchema.test(id)) return NextResponse.json({ error: "Invalid request ID." }, { status: 400 });
  try {
    const user = await requireStudent();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    const parsed = updateHelpRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid help request data." }, { status: 400 });
    }
    const result = await updateHelpRequest(id, user.id, parsed.data);
    if (result.kind === "not_found") return NextResponse.json({ error: "Help request not found." }, { status: 404 });
    if (result.kind === "forbidden") return NextResponse.json({ error: "You cannot modify this help request." }, { status: 403 });
    if (result.kind === "closed") {
      return NextResponse.json({ error: "Only open help requests can be modified." }, { status: 409 });
    }
    if (result.kind !== "updated") {
      return NextResponse.json({ error: "Unable to update help request." }, { status: 500 });
    }
    return NextResponse.json({ helpRequest: result.request });
  } catch (error) {
    return authError(error) ?? NextResponse.json({ error: "Unable to update help request." }, { status: 500 });
  }
}
