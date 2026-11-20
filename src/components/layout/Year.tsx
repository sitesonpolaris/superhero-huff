import { cacheLife } from "next/cache";

/** Current year, cached so `new Date()` doesn't block prerendering. */
export async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
