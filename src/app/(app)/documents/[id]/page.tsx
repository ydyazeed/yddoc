import { cache } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getDocumentForEditor } from "@/actions/documents"
import { TiptapEditor } from "@/components/editor/tiptap-editor"
import { DocumentHeader } from "@/components/editor/document-header"
import { ShareDialogButton } from "@/components/sharing/share-dialog-button"
import type { Prisma } from "@prisma/client"

const loadDocument = cache(getDocumentForEditor)

type DocumentPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: DocumentPageProps): Promise<Metadata> {
  const { id } = await params
  const doc = await loadDocument(id)
  const title = doc?.title?.trim()
  return { title: title || "YDDoc" }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params
  const doc = await loadDocument(id)

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
          initialTitle={doc.title}
          editable={doc.isOwner || !!doc.editorShareToken}
          shareToken={doc.editorShareToken ?? undefined}
        />
      </main>
    </div>
  )
}
