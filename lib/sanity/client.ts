import { createClient, type SanityClient } from "@sanity/client";
import "server-only";

/**
 * The single module that reads Sanity env vars and instantiates the client.
 * `server-only` keeps it (and its future API tokens) out of the browser bundle.
 * When the project isn't configured yet, `client` is null so every page still
 * builds and renders an empty state.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-08-20";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export const isSanityConfigured = Boolean(projectId && dataset);

export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId: projectId as string,
      dataset: dataset as string,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;
