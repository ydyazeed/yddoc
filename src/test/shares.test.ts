import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGetUser = vi.hoisted(() => vi.fn())
const mockPrisma = vi.hoisted(() => ({
  document: {
    findFirst: vi.fn(),
  },
  documentShare: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  documentAccess: {
    upsert: vi.fn(),
  },
}))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))

// Mock nanoid so tokens are predictable in tests
vi.mock("nanoid", () => ({ nanoid: vi.fn(() => "test-token-21chars-here") }))

import {
  createShareLink,
  getShareLinks,
  deleteShareLink,
  getDocumentByToken,
} from "@/actions/shares"

const USER_ID = "user-uuid-abc"
const DOC_ID = "doc-uuid-def"

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } })
})

describe("createShareLink", () => {
  it("creates a share link with VIEWER role", async () => {
    mockPrisma.document.findFirst.mockResolvedValueOnce({
      id: DOC_ID,
      ownerId: USER_ID,
    })
    const mockShare = {
      id: "share-id",
      documentId: DOC_ID,
      shareToken: "test-token-21chars-here",
      role: "VIEWER",
      createdAt: new Date(),
    }
    mockPrisma.documentShare.create.mockResolvedValueOnce(mockShare)

    const result = await createShareLink(DOC_ID, "VIEWER")

    expect(mockPrisma.documentShare.create).toHaveBeenCalledWith({
      data: {
        documentId: DOC_ID,
        shareToken: "test-token-21chars-here",
        role: "VIEWER",
      },
    })
    expect(result).toEqual(mockShare)
  })

  it("throws when user is not document owner", async () => {
    mockPrisma.document.findFirst.mockResolvedValueOnce(null)

    await expect(createShareLink(DOC_ID, "VIEWER")).rejects.toThrow(
      "Not authorized"
    )
  })
})

describe("getShareLinks", () => {
  it("returns share links for document owner", async () => {
    mockPrisma.document.findFirst.mockResolvedValueOnce({
      id: DOC_ID,
      ownerId: USER_ID,
    })
    const mockLinks = [
      {
        id: "link-1",
        shareToken: "token1",
        role: "VIEWER",
        createdAt: new Date(),
      },
    ]
    mockPrisma.documentShare.findMany.mockResolvedValueOnce(mockLinks)

    const result = await getShareLinks(DOC_ID)
    expect(result).toEqual(mockLinks)
  })

  it("throws when user is not owner", async () => {
    mockPrisma.document.findFirst.mockResolvedValueOnce(null)
    await expect(getShareLinks(DOC_ID)).rejects.toThrow("Not authorized")
  })
})

describe("deleteShareLink", () => {
  it("deletes a share link owned by the user's document", async () => {
    const mockShare = {
      id: "share-id",
      documentId: DOC_ID,
      document: { ownerId: USER_ID },
    }
    mockPrisma.documentShare.findUnique.mockResolvedValueOnce(mockShare)
    mockPrisma.documentShare.delete.mockResolvedValueOnce({})

    await deleteShareLink("share-id")

    expect(mockPrisma.documentShare.delete).toHaveBeenCalledWith({
      where: { id: "share-id" },
    })
  })

  it("throws when share does not belong to the user's document", async () => {
    mockPrisma.documentShare.findUnique.mockResolvedValueOnce({
      id: "share-id",
      documentId: DOC_ID,
      document: { ownerId: "other-user" },
    })

    await expect(deleteShareLink("share-id")).rejects.toThrow("Not authorized")
  })

  it("throws when share link not found", async () => {
    mockPrisma.documentShare.findUnique.mockResolvedValueOnce(null)
    await expect(deleteShareLink("bad-id")).rejects.toThrow("Not authorized")
  })
})

describe("getDocumentByToken", () => {
  it("returns share + document for valid token", async () => {
    const mockShare = {
      id: "share-id",
      shareToken: "valid-token",
      role: "VIEWER",
      document: { id: DOC_ID, title: "Test", content: {}, owner: {} },
    }
    mockPrisma.documentShare.findUnique.mockResolvedValueOnce(mockShare)

    const result = await getDocumentByToken("valid-token")
    expect(result).toEqual(mockShare)
  })

  it("returns null for invalid token", async () => {
    mockPrisma.documentShare.findUnique.mockResolvedValueOnce(null)

    const result = await getDocumentByToken("bad-token")
    expect(result).toBeNull()
  })
})
