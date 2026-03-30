import { FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getMyDocuments, getSharedDocuments } from "@/actions/documents"
import { DocumentCard } from "@/components/dashboard/document-card"
import { CreateDocumentButton } from "@/components/dashboard/create-document-button"
import { ImportDocumentButton } from "@/components/dashboard/import-document-button"
import { UserMenu } from "@/components/dashboard/user-menu"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [myDocs, sharedAccesses] = await Promise.all([
    getMyDocuments(),
    getSharedDocuments(),
  ])

  const sharedDocs = sharedAccesses.map((a) => a.document)

  return (
    <div className="min-h-screen bg-[#E8EEFB]">
      {/* Top bar */}
      <header className="bg-white border-b-2 border-[#1A1A2E] shadow-[0px_4px_0px_0px_#1A1A2E] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">
            YDDoc
          </h1>
          <UserMenu
            email={user?.email ?? ""}
            name={user?.user_metadata?.full_name}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* My Documents */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A2E]">My Documents</h2>
            <div className="flex items-center gap-3">
              <ImportDocumentButton />
              <CreateDocumentButton />
            </div>
          </div>

          {myDocs.length === 0 ? (
            <EmptyState message="No documents yet. Create your first one!" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myDocs.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} isOwner />
              ))}
            </div>
          )}
        </section>

        {/* Shared with Me */}
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">
            Shared with Me
          </h2>

          {sharedDocs.length === 0 ? (
            <EmptyState message="No shared documents. Open a shared link to see documents here." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedDocs.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white border-2 border-dashed border-[#C9D5F0] rounded-xl">
      <FileText className="w-10 h-10 text-[#C9D5F0] mb-3" />
      <p className="text-sm text-[#5A6178] text-center max-w-xs">{message}</p>
    </div>
  )
}
