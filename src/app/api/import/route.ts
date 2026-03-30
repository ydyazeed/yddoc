import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { parseTxt } from "@/lib/import/parse-txt"
import { parseMd } from "@/lib/import/parse-md"
import { parseDocx } from "@/lib/import/parse-docx"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTENSIONS = [".txt", ".md", ".docx"]

export async function POST(request: Request) {
  // Auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Parse form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 413 }
    )
  }

  // Validate extension
  const name = file.name.toLowerCase()
  const ext = ALLOWED_EXTENSIONS.find((e) => name.endsWith(e))
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Use .txt, .md, or .docx" },
      { status: 415 }
    )
  }

  // Parse content
  let content: object
  try {
    if (ext === ".txt") {
      const text = await file.text()
      content = parseTxt(text)
    } else if (ext === ".md") {
      const text = await file.text()
      content = await parseMd(text)
    } else {
      // .docx
      const buffer = await file.arrayBuffer()
      content = await parseDocx(buffer)
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 422 }
    )
  }

  // Strip extension from filename for the document title
  const title = file.name.replace(/\.(txt|md|docx)$/i, "")

  const doc = await prisma.document.create({
    data: {
      title,
      content,
      ownerId: user.id,
    },
  })

  return NextResponse.json({ documentId: doc.id }, { status: 201 })
}
