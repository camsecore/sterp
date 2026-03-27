const STERP_AMAZON_TAG = "sterp-20";

/**
 * Detects Amazon product URLs and rewrites them with Sterp's affiliate tag.
 * Non-Amazon URLs are returned as-is.
 */
export function rewriteAffiliateUrl(originalUrl: string): string {
  let url: URL;
  try {
    url = new URL(originalUrl);
  } catch {
    return originalUrl;
  }

  // Match amazon.com, amazon.co.uk, amazon.ca, etc.
  const isAmazon = /^(www\.)?amazon\.(com|co\.uk|ca|de|fr|it|es|com\.au|co\.jp|in|com\.br|com\.mx)$/.test(url.hostname);

  if (!isAmazon) {
    return originalUrl;
  }

  // Strip existing tracking params
  url.searchParams.delete("tag");
  url.searchParams.delete("ref");
  url.searchParams.delete("ref_");
  url.searchParams.delete("pf_rd_r");
  url.searchParams.delete("pf_rd_p");
  url.searchParams.delete("pd_rd_r");
  url.searchParams.delete("pd_rd_w");
  url.searchParams.delete("pd_rd_wg");
  url.searchParams.delete("content-id");
  url.searchParams.delete("psc");

  // Add Sterp's affiliate tag
  url.searchParams.set("tag", STERP_AMAZON_TAG);

  return url.toString();
}
