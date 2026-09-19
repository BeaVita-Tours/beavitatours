import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";

const localized = createMiddleware(routing);
export default function proxy(request: NextRequest) {
  const response = localized(request);
  // Each language may use a different guide slug, so do not guess translation links.
  if (/^\/(?:(?:en|it|zh|ja)\/)?guides(?:\/|$)/.test(request.nextUrl.pathname))
    response.headers.delete("link");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|landing(?:/.*)?|.*\\..*).*)"],
};
