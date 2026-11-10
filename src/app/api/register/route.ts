import { NextResponse } from "next/server";
import { registerStudent } from "@/services/user.service";
import { registerUserSchema } from "@/validators/user.schema";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    const parsed = registerUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
    }

    const user = await registerStudent(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Student registration failed.", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
