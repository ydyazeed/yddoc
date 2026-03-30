# YDDoc — Architecture Design

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Auth Pages  │  │  Dashboard   │  │   Document Editor    │ │
│  │  (Login,     │  │  (List docs, │  │   (Tiptap, Toolbar,  │ │
│  │   Signup)    │  │   Import)    │  │    Auto-save)        │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                 │                      │             │
│         ▼                 ▼                      ▼             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Supabase Client (Auth only)                │   │
│  │              + Server Actions / API Routes              │   │
│  └────────────────────────┬───────────────────────────────┘   │
└───────────────────────────┼───────────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVER (Next.js on Vercel)                  │
│                                                               │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐ │
│  │  Middleware   │  │ Server Actions│  │  API Routes        │ │
│  │  (Auth guard, │  │ (CRUD, Share, │  │  (/api/import,     │ │
│  │   session     │  │  Auth sync)   │  │   /api/auth/       │ │
│  │   refresh)    │  │               │  │    callback)       │ │
│  └──────┬────────┘  └──────┬────────┘  └────────┬──────────┘ │
│         │                  │                     │             │
│         ▼                  ▼                     ▼             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                           │   │
│  └────────────────────────┬───────────────────────────────┘   │
└───────────────────────────┼───────────────────────────────────┘
                            │ Connection Pool (pgBouncer)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  SUPABASE (Managed Services)                  │
│                                                               │
│  ┌────────────────────┐  ┌─────────────────────────────────┐ │
│  │   Supabase Auth     │  │   PostgreSQL Database           │ │
│  │   (JWT, Sessions,   │  │   (Users, Documents,            │ │
│  │    Email/Password)  │  │    DocumentShares,              │ │
│  │                     │  │    DocumentAccess)              │ │
│  └─────────────────────┘  └─────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 2. Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Prisma for all DB access, Supabase client for auth only** | Single ORM with type-safe queries and migration management. Avoids mixing two data access patterns. |
| **Server Actions for mutations** | Colocated with Next.js, type-safe, no API route boilerplate for standard CRUD. |
| **API Route for file import** | Server Actions handle `FormData` less cleanly when reading raw file buffers. Route handlers give direct `Request` access. |
| **Tiptap JSON for document storage** | Lossless round-trip — the stored format is identical to the editor's internal representation. No conversion on load/save. |
| **No real-time collaboration** | Dramatically reduces complexity. Tiptap supports Yjs for future real-time if needed. |
| **Share-by-link (not user-based)** | No need to search for users. `DocumentAccess` tracks which authenticated users visited shared links — powers "Shared with Me". |
| **nanoid for share tokens** | URL-safe, 21 chars = ~124 bits of entropy. Unguessable at any reasonable scale. |

## 3. Data Flows

**Auto-Save:**
```
User types
  → Tiptap onUpdate → useAutoSave clears + resets 2.5s debounce
  → [2.5s inactivity] → updateDocument server action
  → Verify ownership or editor share token
  → Prisma UPDATE documents SET content = $json, updatedAt = now()
  → SaveIndicator: "Saved"
```

**Share-by-Link:**
```
Owner generates link
  → createShareLink: verify owner → nanoid(21) → INSERT DocumentShare
  → Returns {APP_URL}/shared/{token}

Recipient opens /shared/{token}
  → getDocumentByToken: SELECT DocumentShare JOIN Document JOIN User
  → Not found → 404
  → Found + authenticated → UPSERT DocumentAccess (powers "Shared with Me")
  → VIEWER → editable=false, toolbar hidden
  → EDITOR → editable=true, shareToken passed to save actions
```

**File Import:**
```
User selects file → FormData POST /api/import
  → Authenticate → validate extension + size (≤5MB)
  → .txt  → split lines → Tiptap JSON paragraphs
  → .md   → marked() → HTML → generateJSON()
  → .docx → mammoth.convertToHtml() → generateJSON()
  → prisma.document.create({ title: filename, content: json, ownerId })
  → Return { documentId } → client redirects to /documents/{id}
```
