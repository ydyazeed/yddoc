import mammoth from "mammoth"
import { generateJSON } from "@tiptap/html"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"

const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Underline,
]

export async function parseDocx(buffer: ArrayBuffer): Promise<object> {
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
  return generateJSON(result.value, extensions)
}
