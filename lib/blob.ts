import { put } from "@vercel/blob";
import type { Attachment } from "./types";

export const MAX_UPLOAD = {
  image: 8 * 1024 * 1024,
  video: 25 * 1024 * 1024,
  doc: 10 * 1024 * 1024,
};

export const ALLOWED_MIME: Record<string, keyof typeof MAX_UPLOAD> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "application/pdf": "doc",
  "text/plain": "doc",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "doc",
  "application/vnd.ms-excel": "doc",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "doc",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "doc",
  "application/zip": "doc",
};

const LIMIT_LABEL: Record<keyof typeof MAX_UPLOAD, string> = {
  image: "8 MB (gambar)",
  video: "25 MB (video)",
  doc: "10 MB (dokumen)",
};

export async function uploadFromFormData(
  formData: FormData,
  field: string,
): Promise<Attachment | null> {
  const file = formData.get(field);
  if (!file) return null;
  if (!(file instanceof File)) {
    throw new Error("Berkas yang dikirim tidak valid.");
  }

  const kind = ALLOWED_MIME[file.type];
  if (!kind) {
    throw new Error(`Tipe berkas "${file.type}" tidak didukung. Gunakan gambar, video, atau dokumen.`);
  }
  if (file.size > MAX_UPLOAD[kind]) {
    throw new Error(`Ukuran berkas melebihi batas ${LIMIT_LABEL[kind]}.`);
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "-");
  const path = `classroom/${Date.now()}-${safeName}`;
  const blob = await put(path, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: blob.url,
    name: file.name,
    size: file.size,
    mime: file.type,
  };
}
