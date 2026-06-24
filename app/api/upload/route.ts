import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServiceRole } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "house-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

function safeFileStem(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60) || "image";
}

function validateSvg(buffer: Buffer) {
  const source = buffer.toString("utf8");
  return /<svg[\s>]/i.test(source)
    && !/<script|<foreignObject|on[a-z]+\s*=|javascript:/i.test(source);
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const uploadedPaths: string[] = [];
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
    if (!files.length) {
      return NextResponse.json({ error: "Оберіть щонайменше одне зображення." }, { status: 400 });
    }

    const uploads = await Promise.all(files.map(async (file) => {
      const extension = ALLOWED_IMAGE_TYPES[file.type];
      if (!extension) {
        throw new UploadError(`Файл «${file.name}» має непідтримуваний формат.`);
      }
      if (!file.size) throw new UploadError(`Файл «${file.name}» порожній.`);
      if (file.size > MAX_FILE_SIZE) {
        throw new UploadError(`Файл «${file.name}» завеликий. Максимальний розмір — 5 МБ.`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (file.type === "image/svg+xml" && !validateSvg(buffer)) {
        throw new UploadError(`SVG-файл «${file.name}» містить небезпечний або некоректний вміст.`);
      }
      return { file, buffer, extension };
    }));

    const supabase = getSupabaseServiceRole();
    const now = new Date();
    const directory = `houses/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const urls: string[] = [];

    for (const { file, buffer, extension } of uploads) {
      const objectPath = `${directory}/${Date.now()}-${randomUUID()}-${safeFileStem(file.name)}${extension}`;
      const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw new Error(`Supabase Storage: ${error.message}`);
      uploadedPaths.push(objectPath);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
      if (!data.publicUrl) throw new Error("Supabase Storage не повернув public URL.");
      urls.push(data.publicUrl);
    }

    return NextResponse.json({ url: urls[0], urls });
  } catch (error) {
    if (uploadedPaths.length) {
      try {
        await getSupabaseServiceRole().storage.from(BUCKET).remove(uploadedPaths);
      } catch (cleanupError) {
        console.error("Не вдалося очистити частково завантажені зображення:", cleanupError);
      }
    }
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Не вдалося завантажити зображення в Supabase Storage:", error);
    return NextResponse.json({ error: "Не вдалося завантажити зображення. Спробуйте ще раз." }, { status: 500 });
  }
}

class UploadError extends Error {}
