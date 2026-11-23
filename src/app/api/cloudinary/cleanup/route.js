import { verifyAccess } from "@/lib/auth-server";
import { destroyIfUnused } from "@/lib/cloudinary-server";
import { CLOUDINARY_ROOT } from "@/lib/site";

// POST autenticado: borra la foto vieja si ningún producto del local la usa.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const slug = String(body.local || "");
  const url = String(body.url || "");
  const access = await verifyAccess(request, slug);
  if (!access) return Response.json({ ok: false }, { status: 401 });
  if (!/^https:\/\//.test(url)) return Response.json({ ok: false }, { status: 400 });

  try {
    const result = await destroyIfUnused({ slug, url, folderRoot: CLOUDINARY_ROOT });
    return Response.json({ ok: true, ...result });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
