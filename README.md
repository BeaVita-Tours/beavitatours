This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Blog (Sanity CMS)

The site includes a blog powered by [Sanity](https://www.sanity.io) as a headless
CMS, with the content-authoring Studio embedded at `/studio`.

- **Setup (one time):** [`docs/sanity-blog-setup.md`](docs/sanity-blog-setup.md) —
  run `pnpm dlx sanity@latest init`, configure the revalidation webhook and
  CORS, set production env vars.
- **Developer guide:** [`docs/blog-dev-guide.md`](docs/blog-dev-guide.md) — how
  the blog is implemented (schemas, GROQ queries, cache-components strategy,
  file map) and how to extend it.
- **Content authors:** [`docs/blog-client-guide.md`](docs/blog-client-guide.md) —
  how to write and publish posts from the Studio.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
