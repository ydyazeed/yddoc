import { notFound } from "next/navigation"
import { getDocumentByToken, recordDocumentAccess } from "@/actions/shares"
import { TiptapEditor } from "@/components/editor/tiptap-editor"
import { DocumentHeader } from "@/components/editor/document-header"
import type { Prisma } from "@prisma/client"

export default async function SharedDocumentPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const share = await getDocumentByToken(token)

  if (!share) notFound()

  // Record access for authenticated users (powers "Shared with Me")
  await recordDocumentAccess(share.documentId)

  const isEditor = share.role === "EDITOR"

  return (
    <div className="min-h-screen bg-[#E8EEFB]">
      <DocumentHeader
        documentId={share.document.id}
        initialTitle={share.document.title}
        isOwner={false}
      />

      {!isEditor && (
        <div className="max-w-4xl mx-auto px-6 pt-3">
          <div className="flex items-center gap-2 bg-[#C9D5F0] border-2 border-[#1A1A2E] rounded-xl px-4 py-2 text-sm font-medium text-[#5A6178]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#C9D5F0] border-2 border-[#1A1A2E] rounded-full text-xs font-semibold text-[#1A1A2E]">
              VIEWER
            </span>
            You have read-only access to this document.
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-6">
        <TiptapEditor
          documentId={share.document.id}
          initialContent={share.document.content as Prisma.JsonValue}
          editable={isEditor}
          shareToken={isEditor ? token : undefined}
        />
      </main>
    </div>
  )
}
