import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every page is prerendered at build time and nothing revalidates, so the
// cache only ever reads, and it reads from the static assets: no R2 bucket to
// create or pay for. If a page ever needs revalidation, this has to change.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
