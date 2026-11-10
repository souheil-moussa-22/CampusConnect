import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/permissions";
import { getStudentProfile, updateStudentProfile } from "@/services/profile.service";
import { profileUpdateSchema } from "@/validators/profile.schema";

function authErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "Authentication required.") {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof Error && error.message === "Insufficient permissions.") {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return null;
}

export async function GET() {
  try {
    const user = await requireStudent();
    const profile = await getStudentProfile(user.id);
    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json(
      { error: "Unable to retrieve profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireStudent();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
    }
    const profile = await updateStudentProfile(user.id, {
      full_name: parsed.data.fullName,
      specialty: parsed.data.specialty,
      academic_level: parsed.data.academicLevel,
      bio: parsed.data.bio || null,
      availability: parsed.data.availability || null
    });
    return NextResponse.json({ profile });
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json(
      { error: "Unable to update profile." },
      { status: 500 }
    );
  }
}
