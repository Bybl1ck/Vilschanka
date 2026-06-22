import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

function safeFileStem(fileName: string) {
  return path.parse(fileName).name
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
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Потрібен вхід до адмін-панелі." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "Оберіть щонайменше одне зображення." }, { status: 400 });
    }

    const uploads = await Promise.all(files.map(async (file) => {
      if (!ALLOWED_IMAGE_TYPES[file.type]) {
        throw new UploadError(`Файл «${file.name}» має непідтримуваний формат. Дозволено JPG, PNG, WebP або SVG.`);
      }
      if (!file.size) {
        throw new UploadError(`Файл «${file.name}» порожній.`);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new UploadError(`Файл «${file.name}» завеликий. Максимальний розмір — 5 МБ.`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (file.type === "image/svg+xml" && !validateSvg(buffer)) {
        throw new UploadError(`SVG-файл «${file.name}» містить небезпечний або некоректний вміст.`);
      }
      return { file, buffer };
    }));

    const uploadsDirectory = path.join(process.cwd(), "public", "images", "uploads");
    await fs.mkdir(uploadsDirectory, { recursive: true });

    const paths: string[] = [];
    for (const { file, buffer } of uploads) {
      const extension = ALLOWED_IMAGE_TYPES[file.type];
      const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeFileStem(file.name)}${extension}`;
      await fs.writeFile(path.join(uploadsDirectory, fileName), buffer);
      paths.push(`/images/uploads/${fileName}`);
    }

    return NextResponse.json({ paths });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Не вдалося завантажити зображення:", error);
    return NextResponse.json({ error: "Не вдалося завантажити зображення. Спробуйте ще раз." }, { status: 500 });
  }
}

class UploadError extends Error {}
