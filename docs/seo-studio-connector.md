# SEO Workspace integration

Publish guides at `/guides/<slug>` and apply page SEO changes from SEO Workspace.

The site is English-only. SEO Workspace still publishes for the old localized
site (`https://www.beavitatours.com`, `/en/...` paths), and the website accepts
that shape as well as its own paths:

- English guides are served at `/guides/<slug>`; old `/en/guides/<slug>` links
  redirect there. Guides in other languages are ignored.
- Page entries apply to the matching page here: `/en/about` → `/about`,
  `/en/tours/shared-tours` → `/tours/group-tours`, `/en/rates` →
  `/tours/private-tours`. Entries for other languages, and for pages that no
  longer exist (`/en/tours/prosecco`), are ignored. hreflang alternates are not
  rendered.
- The managed pages are listed in `lib/seo/routes.ts`.

Publications are cached (`seo` profile in `next.config.ts`, one minute) and
refreshed at once when SEO Workspace calls `POST /api/seo/connection`.
Preview deployments and `SEO_DELIVERY_MODE=preview` are never indexed.

## Vercel setup

| Variable | Value |
| --- | --- |
| `SEO_DELIVERY_MODE` | `live` |
| `SEO_STUDIO_URL` | `https://beavitatours-seo-production.up.railway.app` |
| `SEO_STUDIO_READ_TOKEN` | Private read token |
| `SEO_REFRESH_SECRET` | Private refresh secret |

## Tests

- `pnpm test` — contract, transport, path mapping and delivery modes
  (`lib/seo/__tests__`).
- `pnpm test:e2e` — `e2e/seo.spec.ts`, against the mock in
  `e2e/mock-seo-workspace.mjs`.
