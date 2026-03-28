import Script from "next/script";

const UMAMI_WEBSITE_ID = "d4e96336-52f1-40b1-bb48-a6cad60e4fa9";
const UMAMI_SRC = "https://cloud.umami.is/script.js";

export function Umami() {
  return (
    <Script
      src={UMAMI_SRC}
      data-website-id={UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
      defer
    />
  );
}
