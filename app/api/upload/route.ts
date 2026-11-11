import { NextResponse } from "next/server";
import { requireUser } from "@/lib/rbac";
import { uploadFromFormData } from "@/lib/blob";

export async function POST(request: Request) {
  await requireUser();

  const formData = await request.formData();
  try {
    const attachment = await uploadFromFormData(formData, "file");
    if (!attachment) {
      return NextResponse.json(
        { ok: false, error: "Tidak ada berkas yang diunggah." },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true, attachment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengunggah berkas.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Metode tidak diizinkan. Gunakan POST." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;

