/**
 * Stub for `next/cache` under Vitest.
 *
 * `cacheLife()` and `cacheTag()` throw outside a Next build/dev server ("only
 * available with the `cacheComponents` config"), which would make every cached
 * wrapper in lib/regiondo untestable. The `"use cache"` directive itself is
 * just a string literal to Vitest, so stubbing these three turns the cached
 * functions into ordinary async functions — which is exactly what we want to
 * test: the request, parse and map path, not Next's cache implementation.
 */
export function cacheLife(_profile: string | { stale?: number }): void {}
export function cacheTag(..._tags: string[]): void {}
export function revalidateTag(_tag: string, _profile?: string | { expire?: number }): void {}
export function updateTag(_tag: string): void {}
export function revalidatePath(_path: string): void {}
