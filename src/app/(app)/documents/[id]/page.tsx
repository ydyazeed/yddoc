import { notFound } from "next/navigation"
import { getDocumentForEditor } from "@/actions/documents"
import { TiptapEditor } from "@/components/editor/tiptap-editor"
import { DocumentHeader } from "@/components/editor/document-header"
import { ShareDialogButton } from "@/components/sharing/share-dialog-button"
import type { Prisma } from "@prisma/client"

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const doc = await getDocumentForEditor(id)

  if (!doc) notFound()

  return (
    <div className="min-h-screen bg-[#E8EEFB]">
      <DocumentHeader
        documentId={doc.id}
        initialTitle={doc.title}
        isOwner={doc.isOwner}
        shareButton={<ShareDialogButton documentId={doc.id} />}
      />

      <main className="max-w-4xl mx-auto px-6 py-6">
        <TiptapEditor
          documentId={doc.id}
          initialContent={doc.content as Prisma.JsonValue}
          editable={doc.isOwner || !!doc.editorShareToken}
          shareToken={doc.editorShareToken ?? undefined}
        />
      </main>
    </div>
  )
}
