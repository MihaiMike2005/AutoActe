import { getSession } from "@/lib/auth/session";
import { getStoredFile } from "@/lib/ocr/upload-store";

export async function GET(_req: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const session = await getSession();
  if (!session?.verified_2fa) return new Response("Unauthorized", { status: 401 });

  const { documentId } = await params;
  const file = getStoredFile(documentId);
  const canView = file && (file.owner_id === session.user_id || session.role === "system");
  if (!file || !canView) return new Response("Not found", { status: 404 });

  return new Response(file.bytes as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": file.mime_type,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
