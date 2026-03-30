# YDDoc

A lightweight collaborative document editor. Create, edit, and share documents with rich text formatting and link-based access control.

## Features

- Rich text editor (bold, italic, underline, headings, lists) powered by Tiptap
- Auto-save with debounce (no manual save needed)
- Share documents via link with Viewer or Editor roles
- Import `.txt`, `.md`, and `.docx` files
- "Shared with Me" dashboard section tracks documents you've visited via shared links

## Tech Stack

- **Next.js 16** (App Router, server actions)
- **Tiptap** (ProseMirror-based rich text editor)
- **Supabase** (auth + PostgreSQL)
- **Prisma 7** (ORM with `@prisma/adapter-pg`)
- **Tailwind CSS v4** + shadcn/ui

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then:

- **Authentication > Providers > Email** — ensure Email is enabled
- **Authentication > Settings** — disable "Confirm email" for easier local testing

### 3. Configure environment variables

Copy `.env.local` and fill in your values:

```bash
# Connection pooler URL (port 6543) — used by the app at runtime
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true"

# Direct connection URL (port 5432) — used by Prisma CLI for migrations
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# From Supabase dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

If your database password contains special characters (`@`, `#`, `!`, etc.), URL-encode them (e.g. `@` → `%40`).

Find these values in your Supabase dashboard under **Settings > Database** and **Settings > API**.

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Run tests

```bash
npm test
```

---

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Login and signup pages
│   ├── (app)/           # Authenticated routes
│   │   ├── dashboard/   # Document list (owned + shared)
│   │   └── documents/[id]/  # Editor page
│   ├── shared/[token]/  # Public shared document view
│   └── api/
│       ├── auth/callback/   # Supabase OAuth callback
│       └── import/          # File import endpoint
├── actions/             # Next.js server actions (auth, documents, shares)
├── components/
│   ├── editor/          # TiptapEditor, Toolbar, DocumentHeader, SaveIndicator
│   ├── dashboard/       # DocumentCard, CreateDocumentButton, ImportDocumentButton
│   ├── sharing/         # ShareDialog
│   └── auth/            # LoginForm, SignupForm
├── hooks/
│   └── use-auto-save.ts # Debounced save with status tracking
└── lib/
    ├── prisma.ts         # Singleton Prisma client (PrismaPg adapter)
    ├── supabase/         # Browser + server Supabase clients
    └── import/           # Parsers for .txt, .md, .docx
```

### Key design decisions

**Auth**: Supabase handles authentication. On sign-in/sign-up, the returned user object is immediately upserted into the Prisma `User` table so application queries can use a consistent UUID.

**Content storage**: Editor content is stored as Tiptap JSON (JSONB column) for lossless round-trips. No HTML serialization in the database.

**Sharing**: A `DocumentShare` row holds a `nanoid` token and a `VIEWER`/`EDITOR` role. The `/shared/[token]` page is public — no login required to view. When an authenticated user visits a shared link, a `DocumentAccess` row is upserted, which powers the "Shared with Me" dashboard section.

**Prisma 7**: Requires an explicit database adapter (`@prisma/adapter-pg`) — `new PrismaClient()` alone no longer works. The Prisma CLI uses `DIRECT_URL` (direct connection) for migrations; the app uses `DATABASE_URL` (connection pooler) at runtime.

## Deployment

Push to GitHub and import in [Vercel](https://vercel.com). Set the same environment variables in the Vercel project settings.

Override the build command in Vercel to generate the Prisma client before building:

```
npx prisma generate && next build
```

Run migrations against the production database before the first deploy:

```bash
DATABASE_URL="<direct connection string>" npx prisma migrate deploy
```
