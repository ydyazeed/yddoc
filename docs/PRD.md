# YDDoc — Product Requirements Document

## 1. Overview

**Product**: YDDoc — A lightweight collaborative document editor inspired by Google Docs.

**Problem**: Teams need a simple way to create, edit, and share rich-text documents without the overhead of a full productivity suite.

**Solution**: A web-based document editor with rich text formatting, share-by-link collaboration, file import, and persistent storage — deployed as a fast, modern single-page application.

**Target Users**: Small teams and individuals who need quick, shareable document editing with minimal friction.

---

## 2. Functional Requirements

### 2.1 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-1 | Users can sign up with email and password | P0 |
| AUTH-2 | Users can log in with existing credentials | P0 |
| AUTH-3 | Users can log out from any page | P0 |
| AUTH-4 | Unauthenticated users are redirected to `/login` when accessing protected routes | P0 |
| AUTH-5 | Session persists across browser tabs and survives page refresh | P0 |
| AUTH-6 | A Prisma `User` row is created/updated on every successful auth event (synced from Supabase Auth) | P0 |

**Auth Flow**:
```
User submits signup form
  → Supabase Auth creates auth user (stores password hash, issues JWT)
  → Client calls syncUser() server action
  → Server reads Supabase session, upserts Prisma User row (id = supabase user.id)
  → Redirect to /dashboard

User submits login form
  → Supabase Auth validates credentials, issues session
  → Client calls syncUser()
  → Redirect to /dashboard

User clicks logout
  → Supabase Auth signs out, clears session cookies
  → Redirect to /login
```

### 2.2 Document Management

| ID | Requirement | Priority |
|----|-------------|----------|
| DOC-1 | Users can create a new blank document (defaults to "Untitled Document") | P0 |
| DOC-2 | Users can rename a document inline from the editor header | P0 |
| DOC-3 | Users can delete documents they own (with confirmation dialog) | P0 |
| DOC-4 | Documents are listed on the dashboard in two sections: "My Documents" and "Shared with Me" | P0 |
| DOC-5 | Each document card displays: title, last modified (relative time), owner name | P0 |
| DOC-6 | Clicking a document card navigates to the editor at `/documents/[id]` | P0 |
| DOC-7 | Empty states are shown when a section has no documents | P1 |

### 2.3 Rich Text Editing

| ID | Requirement | Priority |
|----|-------------|----------|
| EDIT-1 | Editor supports **bold**, *italic*, and underline formatting | P0 |
| EDIT-2 | Editor supports headings: H1, H2, H3 | P0 |
| EDIT-3 | Editor supports bulleted (unordered) lists | P0 |
| EDIT-4 | Editor supports numbered (ordered) lists | P0 |
| EDIT-5 | A fixed toolbar at the top of the editor provides toggle buttons for all formatting options | P0 |
| EDIT-6 | Toolbar buttons reflect active state (e.g., bold button is highlighted when cursor is in bold text) | P0 |
| EDIT-7 | Standard keyboard shortcuts work: Ctrl/Cmd+B (bold), Ctrl/Cmd+I (italic), Ctrl/Cmd+U (underline) | P1 |
| EDIT-8 | Undo/Redo via Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z | P1 |

### 2.4 Auto-Save

| ID | Requirement | Priority |
|----|-------------|----------|
| SAVE-1 | Document content auto-saves after 2.5 seconds of typing inactivity (debounced) | P0 |
| SAVE-2 | Document title auto-saves after 1 second of inactivity | P0 |
| SAVE-3 | A save indicator displays current state: idle (hidden), "Saving...", "Saved" (fades after 2s) | P0 |
| SAVE-4 | Save errors are shown to the user via a toast notification | P1 |

### 2.5 Sharing

| ID | Requirement | Priority |
|----|-------------|----------|
| SHARE-1 | Document owners can generate a shareable link from a "Share" button in the editor | P0 |
| SHARE-2 | Each share link has a role: **Viewer** (read-only) or **Editor** (read-write) | P0 |
| SHARE-3 | Share links use cryptographically random tokens (nanoid, 21 chars) | P0 |
| SHARE-4 | Owners can view all active share links for a document in a dialog | P0 |
| SHARE-5 | Owners can revoke (delete) individual share links | P0 |
| SHARE-6 | Users can copy a share link to clipboard with one click | P0 |
| SHARE-7 | Shared documents accessed by authenticated users appear in their "Shared with Me" section | P0 |
| SHARE-8 | Viewers see the editor in read-only mode with the toolbar hidden/disabled | P0 |
| SHARE-9 | Editors via share link can edit and auto-save the document | P0 |
| SHARE-10 | Invalid or revoked share tokens show a 404/not-found page | P0 |

### 2.6 File Import

| ID | Requirement | Priority |
|----|-------------|----------|
| IMPORT-1 | Users can import `.txt` files as new editable documents | P0 |
| IMPORT-2 | Users can import `.md` (Markdown) files as new editable documents | P0 |
| IMPORT-3 | Users can import `.docx` (Word) files as new editable documents | P0 |
| IMPORT-4 | The imported file's name (without extension) becomes the document title | P0 |
| IMPORT-5 | File size is capped at 5MB; larger files are rejected with an error | P0 |
| IMPORT-6 | After import, the user is redirected to the new document's editor | P0 |
| IMPORT-7 | Import is accessible via an "Import" button on the dashboard | P0 |

---

## 3. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Editor should feel responsive — no perceptible lag when typing |
| Performance | Dashboard should load within 2 seconds on a broadband connection |
| Persistence | All data (documents, formatting, shares) must survive a full page refresh |
| Security | All mutations require authentication (except accessing a valid share link) |
| Security | Users can only modify documents they own or have editor share access to |
| Security | Share tokens must be unguessable (21-char nanoid = ~124 bits of entropy) |
| Accessibility | Toolbar buttons must have accessible labels (aria-label) |
| Deployment | Must be deployable on free-tier infrastructure (Vercel + Supabase) |
| Collaboration | No real-time sync for MVP — last save wins if two users edit concurrently |

---

## 4. Architecture Design

See [ARCHITECTURE.md](ARCHITECTURE.md) for system diagram, key decisions, and data flow diagrams.

---

## 5. Database Schema

### 5.1 Entity-Relationship Diagram

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────────┐
│    User       │       │    Document        │       │  DocumentShare   │
├──────────────┤       ├───────────────────┤       ├──────────────────┤
│ id (PK, UUID)│◄──┐   │ id (PK, UUID)     │◄──┐   │ id (PK, UUID)    │
│ email        │   │   │ title             │   │   │ documentId (FK)  │──┐
│ name         │   │   │ content (JSONB)   │   │   │ shareToken (UQ)  │  │
│ createdAt    │   └───│ ownerId (FK)      │   └───│ role (ENUM)      │  │
│ updatedAt    │       │ createdAt         │       │ createdAt        │  │
└──────┬───────┘       │ updatedAt         │       └──────────────────┘  │
       │               └─────────┬─────────┘                            │
       │                         │                                      │
       │               ┌────────────────────┐                           │
       │               │  DocumentAccess     │                          │
       │               ├────────────────────┤                           │
       │               │ id (PK, UUID)       │                          │
       └──────────────►│ userId (FK)         │                          │
                       │ documentId (FK)     │◄─────────────────────────┘
                       │ accessedAt          │
                       │ UQ(userId, docId)   │
                       └────────────────────┘
```

### 5.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  documents Document[]
  accesses  DocumentAccess[]
}

model Document {
  id        String   @id @default(uuid()) @db.Uuid
  title     String   @default("Untitled Document")
  content   Json     @default("{}")
  ownerId   String   @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner    User             @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  shares   DocumentShare[]
  accesses DocumentAccess[]

  @@index([ownerId])
}

model DocumentShare {
  id         String    @id @default(uuid()) @db.Uuid
  documentId String    @db.Uuid
  shareToken String    @unique
  role       ShareRole @default(VIEWER)
  createdAt  DateTime  @default(now())

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([shareToken])
  @@index([documentId])
}

model DocumentAccess {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @db.Uuid
  documentId String   @db.Uuid
  accessedAt DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@unique([userId, documentId])
}

enum ShareRole {
  VIEWER
  EDITOR
}
```

### 5.3 Column Details

**User**
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | Matches Supabase Auth `user.id` — NOT auto-generated by Prisma, set explicitly from Supabase |
| email | VARCHAR | UNIQUE, NOT NULL | Synced from Supabase Auth |
| name | VARCHAR | NULLABLE | Display name, extracted from email prefix if not provided |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() | |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated | |

**Document**
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| title | VARCHAR | NOT NULL, DEFAULT "Untitled Document" | |
| content | JSONB | NOT NULL, DEFAULT `{}` | Stores Tiptap JSON document tree |
| ownerId | UUID | FK → User.id, NOT NULL | CASCADE on delete |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() | |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated | Used for "last modified" display |

**DocumentShare**
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| documentId | UUID | FK → Document.id, NOT NULL | CASCADE on delete |
| shareToken | VARCHAR | UNIQUE, NOT NULL | 21-char nanoid, URL-safe |
| role | ENUM(VIEWER, EDITOR) | NOT NULL, DEFAULT VIEWER | |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() | |

**DocumentAccess**
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| userId | UUID | FK → User.id, NOT NULL | CASCADE on delete |
| documentId | UUID | FK → Document.id, NOT NULL | CASCADE on delete |
| accessedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Updated on re-access via upsert |
| | | UNIQUE(userId, documentId) | One record per user-document pair |

---

## 6. API Design

### 6.1 Server Actions

All server actions are defined in `src/actions/` and invoked directly from React components via `"use server"`. They are not REST endpoints — Next.js handles serialization and transport.

#### Auth Actions (`src/actions/auth.ts`)

| Action | Signature | Auth | Description |
|--------|-----------|------|-------------|
| `syncUser` | `() → void` | Required | Reads current Supabase session, upserts Prisma User row. Called after login/signup. |
| `logout` | `() → void` | Required | Calls `supabase.auth.signOut()`, redirects to `/login`. |

#### Document Actions (`src/actions/documents.ts`)

| Action | Signature | Auth | Description |
|--------|-----------|------|-------------|
| `createDocument` | `() → { id: string }` | Required | Creates a blank document owned by the current user. Returns the new document ID. |
| `getMyDocuments` | `() → Document[]` | Required | Returns all documents where `ownerId` = current user, ordered by `updatedAt` DESC. |
| `getSharedDocuments` | `() → Document[]` | Required | Returns documents the user has accessed via share links (via `DocumentAccess` join), excluding owned docs. Ordered by `accessedAt` DESC. |
| `getDocument` | `(id: string) → Document \| null` | Required | Fetches a single document. Returns `null` if the user is not the owner. Includes owner info. |
| `updateDocument` | `(id: string, data: { title?: string, content?: JSON }, shareToken?: string) → void` | Required* | Updates document title and/or content. Authorization: caller must be the owner OR provide a valid `shareToken` with `EDITOR` role. *Share-token path does not require auth (for unauthenticated editors). |
| `deleteDocument` | `(id: string) → void` | Required | Deletes a document. Owner only. |

#### Share Actions (`src/actions/shares.ts`)

| Action | Signature | Auth | Description |
|--------|-----------|------|-------------|
| `createShareLink` | `(documentId: string, role: ShareRole) → { token: string, url: string }` | Required (owner) | Generates a nanoid token, inserts `DocumentShare` row. Returns the full share URL. |
| `getShareLinks` | `(documentId: string) → DocumentShare[]` | Required (owner) | Lists all share links for a document. |
| `deleteShareLink` | `(shareId: string) → void` | Required (owner) | Deletes a share link row. Revokes access for anyone using that link. |
| `getDocumentByToken` | `(token: string) → { document: Document, role: ShareRole } \| null` | None | Public. Looks up a document by share token. Returns `null` if token is invalid. |
| `recordAccess` | `(documentId: string) → void` | Required | Upserts a `DocumentAccess` row for the current user. Called when an authenticated user opens a shared document. |

### 6.2 API Routes

#### `POST /api/import` — File Import

**Request:**
```
Content-Type: multipart/form-data

Fields:
  file: File (required) — .txt, .md, or .docx file, max 5MB
```

**Response (200):**
```json
{
  "documentId": "uuid-of-new-document"
}
```

**Error Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 401 | `{ "error": "Unauthorized" }` | No valid session |
| 400 | `{ "error": "No file provided" }` | Missing file field |
| 400 | `{ "error": "Unsupported file type. Accepted: .txt, .md, .docx" }` | Wrong extension |
| 413 | `{ "error": "File too large. Maximum size is 5MB" }` | File exceeds 5MB |
| 500 | `{ "error": "Failed to process file" }` | Parsing/conversion error |

**Processing Logic:**
```
1. Authenticate via createServerClient + getUser()
2. Extract file from FormData
3. Validate: file exists, extension is .txt/.md/.docx, size ≤ 5MB
4. Convert based on extension:
   .txt  → Split by \n → Array of { type: "paragraph", content: [{ type: "text", text }] }
         → Wrap in { type: "doc", content: [...] }
   .md   → marked(text) → HTML string
         → generateJSON(html, extensions) → Tiptap JSON
   .docx → mammoth.convertToHtml({ buffer }) → { value: html }
         → generateJSON(html, extensions) → Tiptap JSON
5. Create Document: prisma.document.create({ title: filename, content: json, ownerId })
6. Return { documentId }
```

#### `GET /api/auth/callback` — Supabase Auth Callback

**Purpose:** Handles the code exchange after Supabase email confirmation (if enabled).

**Flow:**
```
1. Read `code` from URL search params
2. Exchange code for session via supabase.auth.exchangeCodeForSession(code)
3. Redirect to /dashboard
```

### 6.3 Authorization Matrix

| Resource | Action | Owner | Editor (via share token) | Viewer (via share token) | Unauthenticated |
|----------|--------|-------|--------------------------|--------------------------|-----------------|
| Document | Read (own) | Yes | — | — | No |
| Document | Read (shared) | — | Yes | Yes | Yes (with valid token) |
| Document | Create | Yes | — | — | No |
| Document | Update content | Yes | Yes | No | No |
| Document | Update title | Yes | Yes | No | No |
| Document | Delete | Yes | No | No | No |
| Share | Create link | Yes | No | No | No |
| Share | List links | Yes | No | No | No |
| Share | Revoke link | Yes | No | No | No |
| Import | Upload file | Yes (any authed user) | — | — | No |

---

## 7. Folder Structure

```
yddoc/
├── .env.local                          # Environment variables (git-ignored)
├── .gitignore
├── next.config.ts                      # Next.js config (serverExternalPackages: mammoth)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── components.json                     # shadcn/ui config
├── docs/
│   └── PRD.md                          # This document
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # Prisma migration history
│
└── src/
    ├── middleware.ts                    # Next.js middleware — auth guard, session refresh
    │
    ├── app/
    │   ├── layout.tsx                  # Root layout: fonts, Toaster, global styles
    │   ├── page.tsx                    # Root redirect: → /dashboard (authed) or /login
    │   │
    │   ├── (auth)/                     # Auth route group (no app shell)
    │   │   ├── layout.tsx              # Centered card layout for auth pages
    │   │   ├── login/
    │   │   │   └── page.tsx            # Login page
    │   │   └── signup/
    │   │       └── page.tsx            # Signup page
    │   │
    │   ├── (app)/                      # App route group (with app shell)
    │   │   ├── layout.tsx              # App shell: header with logo, user menu
    │   │   ├── dashboard/
    │   │   │   └── page.tsx            # Dashboard: My Docs + Shared with Me
    │   │   └── documents/
    │   │       └── [id]/
    │   │           └── page.tsx        # Document editor page
    │   │
    │   ├── shared/
    │   │   └── [token]/
    │   │       └── page.tsx            # Public shared document page
    │   │
    │   └── api/
    │       ├── auth/
    │       │   └── callback/
    │       │       └── route.ts        # Supabase auth code exchange
    │       └── import/
    │           └── route.ts            # File upload + conversion endpoint
    │
    ├── actions/
    │   ├── auth.ts                     # syncUser, logout
    │   ├── documents.ts                # CRUD: create, get, update, delete
    │   └── shares.ts                   # createShareLink, getShareLinks, deleteShareLink,
    │                                   # getDocumentByToken, recordAccess
    │
    ├── components/
    │   ├── ui/                         # shadcn/ui components (auto-generated)
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── badge.tsx
    │   │   ├── label.tsx
    │   │   ├── separator.tsx
    │   │   └── toast.tsx / toaster.tsx / use-toast.ts
    │   │
    │   ├── auth/
    │   │   ├── login-form.tsx          # Email + password form, calls supabase.auth.signIn
    │   │   └── signup-form.tsx         # Email + password form, calls supabase.auth.signUp
    │   │
    │   ├── dashboard/
    │   │   ├── document-card.tsx       # Single doc card: title, date, owner, dropdown
    │   │   ├── document-list.tsx       # Grid of DocumentCards with section title
    │   │   ├── create-document-button.tsx  # "New Document" button
    │   │   ├── import-document-button.tsx  # "Import" button with hidden file input
    │   │   └── empty-state.tsx         # Placeholder when no documents exist
    │   │
    │   ├── editor/
    │   │   ├── tiptap-editor.tsx       # Core editor: useEditor, EditorContent, auto-save wiring
    │   │   ├── toolbar.tsx             # Fixed formatting toolbar with toggle buttons
    │   │   ├── save-indicator.tsx      # "Saving..." / "Saved" status display
    │   │   └── document-header.tsx     # Editable title, Share button, back link
    │   │
    │   └── sharing/
    │       └── share-dialog.tsx        # Modal: role selector, generate link, list/copy/delete links
    │
    ├── hooks/
    │   ├── use-auto-save.ts            # Debounced save hook with status management
    │   └── use-current-user.ts         # Get current authenticated user from Supabase
    │
    ├── lib/
    │   ├── prisma.ts                   # Singleton Prisma client (avoids hot-reload connection leaks)
    │   ├── utils.ts                    # cn() helper (clsx + tailwind-merge)
    │   │
    │   ├── supabase/
    │   │   ├── client.ts              # createBrowserClient for client components
    │   │   └── server.ts              # createServerClient for server components/actions
    │   │
    │   └── import/
    │       ├── parse-txt.ts           # .txt → Tiptap JSON
    │       ├── parse-md.ts            # .md → HTML (marked) → Tiptap JSON (generateJSON)
    │       └── parse-docx.ts          # .docx → HTML (mammoth) → Tiptap JSON (generateJSON)
    │
    └── types/
        └── index.ts                   # Shared TypeScript types and interfaces
```

---

## 8. Security Design

### 8.1 Authentication Security

| Concern | Mitigation |
|---------|------------|
| **Password storage** | Handled entirely by Supabase Auth — passwords are hashed with bcrypt, never stored in our database or transmitted to our server. |
| **Session management** | Supabase uses HTTP-only cookies with JWTs. The Next.js middleware refreshes tokens on every request to prevent expiration during active use. |
| **Session fixation** | Supabase rotates the refresh token on each use, invalidating old tokens. |
| **CSRF protection** | Server Actions in Next.js are POST-only and include origin checking by default. API routes validate the Supabase session from cookies (not from headers that can be forged). |

### 8.2 Authorization Security

| Concern | Mitigation |
|---------|------------|
| **Insecure direct object reference (IDOR)** | Every server action and API route verifies that the authenticated user owns the resource or has a valid share token. Document IDs alone are insufficient — ownership is always checked. |
| **Privilege escalation** | Share roles are enforced server-side. A `VIEWER` share token cannot be used to call `updateDocument` — the action explicitly checks for `EDITOR` role. |
| **Share token brute force** | nanoid(21) produces 124 bits of entropy — brute-forcing is computationally infeasible. Rate limiting at the Vercel/infrastructure layer provides additional protection. |
| **Share token enumeration** | Invalid tokens return a generic 404 — no information leakage about whether a token was ever valid. |

### 8.3 Input Validation & Injection Prevention

| Concern | Mitigation |
|---------|------------|
| **SQL injection** | Prisma uses parameterized queries exclusively. No raw SQL is used anywhere in the application. |
| **XSS (Cross-Site Scripting)** | React escapes all rendered content by default. Tiptap content is stored as structured JSON, not raw HTML — no `dangerouslySetInnerHTML` is used. The editor renders from the JSON schema, not from arbitrary HTML. |
| **File upload attacks** | File imports validate the extension whitelist (`.txt`, `.md`, `.docx`) server-side. Files are parsed in memory and discarded — never written to disk or served back. The file content is transformed into structured JSON, stripping any embedded scripts. |
| **File size DoS** | 5MB limit enforced server-side before processing. |
| **Content-Type spoofing** | Extension is validated, not just the MIME type. mammoth.js and marked both safely parse their respective formats without executing embedded code. |

### 8.4 Data Protection

| Concern | Mitigation |
|---------|------------|
| **Data in transit** | All traffic is HTTPS (enforced by Vercel and Supabase). |
| **Data at rest** | Supabase encrypts data at rest on their managed PostgreSQL instances. |
| **Environment variables** | Sensitive values (`DATABASE_URL`, Supabase keys) are stored in Vercel environment variables, never committed to the repository. `.env.local` is in `.gitignore`. |
| **Supabase anon key exposure** | The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose — it's designed for client-side use and provides no elevated access. All data access goes through Prisma on the server, not through Supabase's client-side API. |

### 8.5 Middleware Protection Matrix

```typescript
// src/middleware.ts — Route protection rules

Protected (require auth, redirect to /login if no session):
  /dashboard
  /dashboard/*
  /documents/*

Public (no auth required):
  /login
  /signup
  /shared/*           ← Share links must work without login
  /api/auth/callback  ← Auth flow callback

Excluded from middleware (static assets):
  /_next/*
  /favicon.ico
  /*.svg, /*.png, /*.jpg
```

### 8.6 Rate Limiting & Abuse Prevention

| Layer | Protection |
|-------|------------|
| **Vercel** | Built-in DDoS protection and edge-level rate limiting on the free tier. |
| **Supabase Auth** | Built-in rate limiting on auth endpoints (signup, login) to prevent credential stuffing. |
| **File import** | 5MB size limit. Processing is synchronous per-request — no queue. A large file simply takes longer but doesn't fork background work. |
| **Auto-save** | Client-side debounce (2.5s) prevents rapid-fire save requests. Server-side, each save is an idempotent UPDATE, so duplicate requests are harmless. |

---

## 9. UI Wireframes (ASCII)

Design style: Neo-brutalist. Full guide in [DESIGN.md](DESIGN.md).
All elements use `border-2 border-[#1A1A2E]`, hard offset shadows, `rounded-xl` cards, `rounded-full` buttons.
Page background: `#E8EEFB` (ice blue). Content on white cards.

### 9.1 Dashboard

```
bg: #E8EEFB (ice blue, full page)
╔══════════════════════════════════════════════════════════════════════╗
║  ╭──────╮                                            ╭────────────╮║
║  │YDDoc │  (bold blue pill)                          │ user@e.. ▾ │║
║  ╰──────╯                                            ╰────────────╯║
║  ══ border-b-2, shadow-[0px_4px_0px_0px_#1A1A2E] ════════════════ ║
║                                                                     ║
║  My Documents                  ╭────────────────╮ ╭──────────────╮ ║
║                                │ + New Document │ │  ↑ Import    │ ║
║                                ╰────────────────╯ ╰──────────────╯ ║
║                                (rounded-full pills, hard shadow)    ║
║                                                                     ║
║  ┏━━━━━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━━━━━┓    ║
║  ┃ Project Plan    ┃ ┃ Meeting Notes   ┃ ┃ API Design      ┃    ║
║  ┃                 ┃ ┃                 ┃ ┃                 ┃    ║
║  ┃ 2 hours ago     ┃ ┃ Yesterday       ┃ ┃ 3 days ago      ┃    ║
║  ┃           [⋮]   ┃ ┃           [⋮]   ┃ ┃           [⋮]   ┃    ║
║  ┗━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━┛    ║
║  (white cards, border-2, rounded-xl, shadow-[4px_4px_0px_0px])     ║
║  (hover: shadow grows, card lifts)                                  ║
║                                                                     ║
║  Shared with Me                                                     ║
║                                                                     ║
║  ┏━━━━━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━━━━━┓                          ║
║  ┃ Team Roadmap    ┃ ┃ Design Spec     ┃                          ║
║  ┃ 1 hour ago      ┃ ┃ 5 days ago      ┃                          ║
║  ┃ by jane@co.com  ┃ ┃ by bob@co.com   ┃                          ║
║  ┃   ╭────────╮    ┃ ┃   ╭────────╮    ┃                          ║
║  ┃   │ viewer │    ┃ ┃   │ editor │    ┃                          ║
║  ┃   ╰────────╯    ┃ ┃   ╰────────╯    ┃                          ║
║  ┗━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━┛                          ║
║  (role badges: rounded-full pills, viewer=muted, editor=primary)   ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 9.2 Document Editor

```
bg: #E8EEFB
╔══════════════════════════════════════════════════════════════════════╗
║  ╭──────╮                                      ╭──────╮ ╭───────╮  ║
║  │ ← Bk │   Project Plan (bold, 24px)  Saved  │Share │ │user ▾│  ║
║  ╰──────╯                                ✓     ╰──────╯ ╰───────╯  ║
║  ══ border-b-2, hard shadow bottom ═══════════════════════════════  ║
║                                                                     ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ║
║  ┃  ╭───╮╭───╮╭───╮ │ ╭────╮╭────╮╭────╮ │ ╭───╮╭────╮         ┃  ║
║  ┃  │ B ││ I ││ U │ │ │ H1 ││ H2 ││ H3 │ │ │ • ││ 1. │         ┃  ║
║  ┃  ╰───╯╰───╯╰───╯ │ ╰────╯╰────╯╰────╯ │ ╰───╯╰────╯         ┃  ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
║  (toolbar: white card, border-2, rounded-xl, hard shadow)           ║
║  (active button: bg-primary text-white)                             ║
║                                                                     ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ║
║  ┃                                                               ┃  ║
║  ┃  This is the document content area.                           ┃  ║
║  ┃                                                               ┃  ║
║  ┃  Users can type here with full rich text formatting.          ┃  ║
║  ┃  The content auto-saves after 2.5 seconds of inactivity.     ┃  ║
║  ┃                                                               ┃  ║
║  ┃  • Bullet point one                                           ┃  ║
║  ┃  • Bullet point two                                           ┃  ║
║  ┃                                                               ┃  ║
║  ┃  1. Numbered item                                             ┃  ║
║  ┃  2. Another numbered item                                     ┃  ║
║  ┃                                                               ┃  ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
║  (document: white card, border-2, rounded-xl, shadow, max-w-prose) ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 9.3 Share Dialog

```
(overlay: bg-black/50)
         ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃  Share "Project Plan"                  [✕]   ┃
         ┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
         ┃                                              ┃
         ┃  Generate a new link:                        ┃
         ┃  Role: ╭──────────╮  ╭───────────────╮       ┃
         ┃        │ Viewer ▾ │  │ Generate Link │       ┃
         ┃        ╰──────────╯  ╰───────────────╯       ┃
         ┃  (dropdown + pill button, both hard shadow)  ┃
         ┃                                              ┃
         ┃  ──────────────────────────────────────────  ┃
         ┃  Active Links:                               ┃
         ┃                                              ┃
         ┃  /shared/abc123...  ╭────────╮  Mar 28       ┃
         ┃                     │ viewer │               ┃
         ┃                     ╰────────╯               ┃
         ┃         ╭──────╮  ╭────────╮                 ┃
         ┃         │ Copy │  │ Delete │                 ┃
         ┃         ╰──────╯  ╰────────╯                 ┃
         ┃                                              ┃
         ┃  /shared/xyz789...  ╭────────╮  Mar 30       ┃
         ┃                     │ editor │               ┃
         ┃                     ╰────────╯               ┃
         ┃         ╭──────╮  ╭────────╮                 ┃
         ┃         │ Copy │  │ Delete │                 ┃
         ┃         ╰──────╯  ╰────────╯                 ┃
         ┃                                              ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         (dialog: white card, border-2, rounded-xl, hard shadow)
         (badges: rounded-full, viewer=muted, editor=primary)
```

---

## 10. Deployment Specification

### 10.1 Infrastructure

| Service | Provider | Tier | Purpose |
|---------|----------|------|---------|
| Web hosting | Vercel | Free (Hobby) | Next.js app hosting, serverless functions, CDN |
| Database | Supabase | Free | Managed PostgreSQL, Auth service |
| DNS/SSL | Vercel | Included | Automatic HTTPS, custom domain support |

### 10.2 Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Server | Supabase pooled connection string (`?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Server | Supabase direct connection string (for migrations) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous key (safe to expose) |
| `NEXT_PUBLIC_APP_URL` | Client + Server | Deployed app URL (for share link generation) |

### 10.3 Build & Deploy

```
Build command:   npx prisma generate && next build
Output:          .next/ (handled by Vercel)
Node version:    20.x
Install command: npm install (default)
```

### 10.4 Pre-Deploy Checklist

- [ ] Supabase project created with email/password auth enabled
- [ ] All environment variables set in Vercel project settings
- [ ] `prisma migrate deploy` run against production database
- [ ] `NEXT_PUBLIC_APP_URL` set to final production URL
- [ ] Email confirmation disabled in Supabase (or SMTP configured) for frictionless signup

---

## 11. Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15 | Framework |
| `react`, `react-dom` | ^19 | UI library |
| `@tiptap/react` | ^2 | React bindings for Tiptap editor |
| `@tiptap/starter-kit` | ^2 | Bold, italic, headings, lists, history, etc. |
| `@tiptap/extension-underline` | ^2 | Underline formatting |
| `@tiptap/html` | ^2 | HTML ↔ Tiptap JSON conversion (for file import) |
| `@tiptap/pm` | ^2 | ProseMirror core (peer dependency) |
| `prisma` | ^6 | ORM CLI (dev dependency) |
| `@prisma/client` | ^6 | ORM runtime |
| `@supabase/supabase-js` | ^2 | Supabase client |
| `@supabase/ssr` | ^0.5 | Supabase SSR helpers for Next.js |
| `tailwindcss` | ^4 | Utility-first CSS |
| `shadcn` | latest | UI component CLI |
| `lucide-react` | latest | Icons (included with shadcn) |
| `mammoth` | ^1 | .docx → HTML conversion |
| `marked` | ^15 | Markdown → HTML conversion |
| `nanoid` | ^5 | Secure random token generation |
| `clsx` | latest | Conditional class names (shadcn dep) |
| `tailwind-merge` | latest | Tailwind class deduplication (shadcn dep) |
