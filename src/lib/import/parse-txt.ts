type TiptapDoc = {
  type: "doc"
  content: Array<{ type: "paragraph"; content?: Array<{ type: "text"; text: string }> }>
}

export function parseTxt(text: string): TiptapDoc {
  const lines = text.split("\n")

  const content = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed) {
      return { type: "paragraph" as const }
    }
    return {
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: trimmed }],
    }
  })

  return { type: "doc", content }
}
