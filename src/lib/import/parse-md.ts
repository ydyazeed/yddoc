import { marked } from "marked"
import { generateJSON } from "@tiptap/html"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"

const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Underline,
]

export async function parseMd(markdown: string): Promise<object> {
  const html = await marked(markdown)
  return generateJSON(html, extensions)
}
