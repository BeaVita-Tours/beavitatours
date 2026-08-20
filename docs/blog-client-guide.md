# The Bea Vita Blog — Guide for Content Authors

This guide explains how to write and publish posts on your website's blog.
Everything happens in the **Sanity Studio**, which lives inside your website at
the `/studio` address.

---

## Opening the Studio

1. Go to your website and add **`/studio`** to the end of the address,
   e.g. `https://beavitatours.com/studio`.
2. Log in with the Sanity account you created during setup.

You'll see a menu on the left with three sections: **Posts**, **Authors**,
and **Categories**.

> Tip: on your own computer during development, open `http://localhost:3000/studio`.

## Writing a new post

1. Click **Posts** → **Create new** (or **"Post — starter"** to get a
   ready-to-fill template).
2. Fill in the fields:
   - **Title** — the headline, e.g. *"A Day in the Dolomites"*.
     The **Slug** (the web address part, `.../blog/a-day-in-the-dolomites`)
     is generated for you automatically.
   - **Excerpt** — 1–3 sentences shown on the blog's main page and in search
     results. Keep it under 220 characters.
   - **Cover image** — the big photo at the top. Click to upload, then add
     **Alternative text** (a short description for people who can't see the
     image — also used by Google).
   - **Body** — the article itself. Use the **+** button to add:
     - Paragraphs and headings (`H2`, `H3`, `H4` for section titles)
     - **Bold**, *italic*, and code (for technical snippets)
     - Links (to other websites, or to **other posts on your blog**)
     - Images (with alt text)
     - Bullet / numbered lists and quotes
     - **Code blocks** (for showing code — pick the language and it's highlighted)
   - **Categories** — pick one or more, e.g. *Dolomites* or *Food & Wine*.
     (If the one you want doesn't exist yet, add it under **Categories** first.)
   - **Author** — the person credited. Add authors under **Authors** if needed.
   - **Published at** — when the post goes live. This must be set — and the
     post appears only once this date has passed.
   - **SEO** (optional) — if you want extra control over how the post looks in
     Google and when shared on social media: a custom **SEO title** (max 60
     characters), a **SEO description** (the snippet under the headline), and a
     **share image** (1200×630). Leave them empty to use the title, excerpt,
     and cover image automatically.
3. **Save** (as a draft) whenever you want, then **Publish** when ready.

## Editing and unpublishing

- **Edit** any published post by opening it in Studio and pressing **Publish**
  again after your changes.
- **Unpublish** removes it from the website.
- **Delete** removes it permanently.

## Managing authors and categories

- **Authors**: name, a square photo, and a short bio. Add one before writing a
  post that needs it.
- **Categories**: a title (e.g. *Dolomites*), its auto-generated slug, and an
  optional description that appears at the top of the category page.

## How your post appears on the website

- The blog page (`/blog`) lists posts newest-first, with cover image, title,
  excerpt, author, date, and category tags. Use the category chips and page
  numbers to browse.
- Clicking a post opens the full article at `/blog/your-post-slug`.
- Each category has its own page at `/blog/category/...`, so readers can find
  all posts in one topic.

## How soon does a published post go live?

- **Almost instantly** — the website is notified the moment you publish, thanks
  to a webhook set up during configuration.
- If the webhook isn't configured yet, a new post can take up to a day to
  appear (the site refreshes itself in the background).

## What if something looks wrong?

1. Is the **Published at** date in the past? If it's in the future, the post
   is intentionally hidden.
2. Is the post still a **draft**? It only shows after you press **Publish**.
3. Is there a **Cover image**? Posts look best with one, and search engines
   like it too.

If none of these fix it, ask your developer — they can check whether the
webhook is configured and whether the cache needs a refresh.
