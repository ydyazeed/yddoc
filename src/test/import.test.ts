import { describe, it, expect } from "vitest"
import { parseTxt } from "@/lib/import/parse-txt"
import { parseMd } from "@/lib/import/parse-md"

describe("parseTxt", () => {
  it("converts plain text to Tiptap doc format", () => {
    const result = parseTxt("Hello World\nSecond line")
    expect(result.type).toBe("doc")
    expect(result.content).toHaveLength(2)
    expect(result.content[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "Hello World" }],
    })
    expect(result.content[1]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "Second line" }],
    })
  })

  it("converts empty line to empty paragraph", () => {
    const result = parseTxt("Line one\n\nLine three")
    expect(result.content).toHaveLength(3)
    expect(result.content[1]).toEqual({ type: "paragraph" })
  })

  it("handles empty string", () => {
    const result = parseTxt("")
    expect(result.type).toBe("doc")
    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toEqual({ type: "paragraph" })
  })

  it("trims whitespace from lines", () => {
    const result = parseTxt("  trimmed  ")
    expect(result.content[0].content?.[0].text).toBe("trimmed")
  })
})

describe("parseMd", () => {
  it("converts markdown heading to Tiptap heading node", async () => {
    const result = (await parseMd("# Hello")) as {
      type: string
      content: Array<{ type: string; attrs?: { level: number } }>
    }
    expect(result.type).toBe("doc")
    const heading = result.content.find((n) => n.type === "heading")
    expect(heading).toBeDefined()
    expect(heading?.attrs?.level).toBe(1)
  })

  it("converts markdown paragraph to paragraph node", async () => {
    const result = (await parseMd("Hello world")) as {
      type: string
      content: Array<{ type: string }>
    }
    expect(result.type).toBe("doc")
    const paragraph = result.content.find((n) => n.type === "paragraph")
    expect(paragraph).toBeDefined()
  })

  it("converts markdown bold to mark", async () => {
    const result = (await parseMd("**bold text**")) as {
      type: string
      content: Array<{
        type: string
        content?: Array<{
          type: string
          marks?: Array<{ type: string }>
        }>
      }>
    }
    // Find a text node with a bold mark anywhere in the doc
    const allTextNodes = result.content.flatMap((n) => n.content ?? [])
    const boldNode = allTextNodes.find((n) =>
      n.marks?.some((m) => m.type === "bold")
    )
    expect(boldNode).toBeDefined()
  })

  it("converts markdown list to bulletList node", async () => {
    const result = (await parseMd("- item one\n- item two")) as {
      type: string
      content: Array<{ type: string }>
    }
    const list = result.content.find((n) => n.type === "bulletList")
    expect(list).toBeDefined()
  })
})
