import type { Metadata, Viewport } from "next";
import { NextStudio } from "next-sanity/studio";
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/lib/sanity/client";

// The Studio is a fully client-side app that needs the URL at request time,
// so this route is kept dynamic (cache-components opt-out). The docs' older
// `dynamic = "force-static"` export is rejected by the cache-components build.
export const instant = false;

export const metadata: Metadata = {
  ...studioMetadata,
  title: "BeaVitaTours Studio",
};

export const viewport: Viewport = studioViewport;

export const robots = { index: false };

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-8">
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-lg font-semibold text-neutral-900">
            Sanity is not configured yet
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            Follow the steps in <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs">docs/sanity-blog-setup.md</code>{" "}
            to connect this studio to your Sanity project.
          </p>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
