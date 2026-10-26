# Sanity Blog — Setup Guide

This document covers the **one-time operational setup** for the blog: connecting
Sanity, configuring the webhook, and deploying. Read the
[developer guide](./blog-dev-guide.md) to understand how the blog is built, and
the [client guide](./blog-client-guide.md) to teach content authors how to use it.

---

## 1. Run `sanity init` (one time, you)

The code for the blog, the Studio, and the schemas is already in the repo. What
is missing is a **Sanity project** (a Sanity account + project ID), which only
you can create.

Use the **`--bare`** flag so the CLI only creates the project and prints its ID
— it won't try to scaffold a Studio folder. (The normal flow fails here: the
Studio already exists in this repo, so any output path you give it is either
"directory not empty" for the project root or "no package.json" for a
subfolder.)

```bash
pnpm dlx sanity@latest init --bare --project-name "beavitatours" --dataset-default
```

1. The CLI opens your browser to **log in** (or create a Sanity account).
2. It creates a project named **"beavitatours"** with a public **`production`**
   dataset, then prints the **project ID** to the terminal.
3. Copy that ID into `.env.local`:

   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=<paste the id here>
   ```

Restart `pnpm dev` and open **http://localhost:3000/studio** — you should see
the Sanity Studio.

> **Already have a project?** Run `pnpm dlx sanity@latest init --bare --project <id>`
> to print/link an existing one. Or skip the CLI entirely: create the project in
> the [Sanity dashboard](https://www.sanity.io/manage) and copy its **Project ID**
> and **dataset name** into `.env.local`.

## 2. Allow the app to talk to Sanity (CORS)

In the Sanity dashboard → your project → **API → CORS origins**, add:

```
http://localhost:3000
```

with **"Allow credentials"** checked. Without this, the embedded Studio at
`/studio` will fail to log in. In production, add your production origin
(e.g. `https://beavitatours.com`) the same way.

## 3. Revalidation webhook (optional but recommended)

By default, blog pages are cached and re-generated in the background at most
once a day. To make new posts appear **within seconds of publishing**, wire a
webhook:

1. In `.env.local`, set a strong secret:

   ```
   REVALIDATE_SECRET=<a long random string>
   ```

   (Generate one with `openssl rand -hex 24`.)

2. In the Sanity dashboard → your project → **API → Webhooks → Add webhook**:
   - **Name:** `beavitatours revalidate`
   - **URL:** `https://<your-domain>/api/revalidate?secret=<REVALIDATE_SECRET>`
   - **Dataset:** `production`
   - **Triggers:** Create, Update, Delete
   - **Filter:** `_type in ["post", "author", "category"]`

Without the webhook, published posts still appear — just up to a day later
(the fallback revalidation window).

## 4. Production environment variables

Set these in your hosting provider (Vercel → Project → Environment Variables):

| Variable | Public? | Description |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ public | From the Sanity dashboard. |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ public | Usually `production`. |
| `NEXT_PUBLIC_SANITY_API_VERSION` | ✅ public | Already defaulted to `2026-08-20`. |
| `REVALIDATE_SECRET` | ❌ server-only | Matches the webhook URL. |
| `SANITY_API_TOKEN` | ❌ server-only | Only needed for draft previews (not used yet). |

`.env.example` documents these. `.env.local` is gitignored; never commit secrets.

## 5. Adding a blog post (quick version)

1. Open **/studio** in the running app.
2. **Posts → Create new** (or use the **"Post — starter"** template).
3. Fill in **Title**, check **Slug** auto-generates, write the **Excerpt**,
   add a **Cover image** (with alt text), write the **Body**, pick a
   **Category**, an **Author**, and set **Published at**.
4. Click **Publish**.
5. The post appears on `/blog`. With the webhook it's instant; without it,
   within a day (or run `POST /api/revalidate?secret=...` to force it).

Full instructions with screenshots-equivalents are in the
[client guide](./blog-client-guide.md).

## 6. Adding new users (clients / content authors)

Give each client their own login so they can write posts. Each person needs
their **own Sanity account** — don't share a single login.

1. Go to **manage.sanity.com** and sign in with your admin account.
2. Open the **project** (the one you created in step 1, e.g. "beavitatours").
3. Go to **Members** in the project settings.
4. Click **Invite member** and enter the client's **email address**.
5. Pick a **role**: for a content author choose **Editor** (can create, edit
   and publish posts but can't change settings or manage members). Avoid
   giving clients **Administrator**.
6. Send the invite. The client gets an email; they click the link and sign in
   with **Google** using the same email.

That's all. From then on the client opens `/studio`, chooses **"Continue with
Google"**, and is recognized automatically — Sanity matches members by email,
so there's nothing else to configure.

Notes:
- **Invite each client to each project individually** — members aren't shared
  between projects. If you have several client sites, repeat this per project.
- You must have an **Administrator** role in the project to invite members.
- Use the **same email** for the invite and the Google login. A different email
  is treated as a different person.
- (CLI alternative: `npx sanity users invite <email> --role editor`.)

## 7. Verification checklist

- [ ] `pnpm dev` → `/blog` shows posts, `/blog/<slug>` shows a full article.
- [ ] `/studio` loads the full Studio (no navbar/footer).
- [ ] `POST /api/revalidate?secret=<your-secret>` returns `{"ok": true, ...}`.
- [ ] Publishing a post in Studio makes it appear on `/blog` quickly.
