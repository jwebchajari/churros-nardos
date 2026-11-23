import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAccess } from "@/lib/auth-server";
import { localTag } from "@/lib/menu";

// POST autenticado: el panel lo llama después de guardar para que la carta se actualice al instante.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const slug = String(body.local || "");
  const access = await verifyAccess(request, slug);
  if (!access) return Response.json({ ok: false }, { status: 401 });

  revalidateTag(localTag(slug), { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}
