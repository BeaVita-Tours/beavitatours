#!/usr/bin/env node
/**
 * A small stand-in for the Regiondo API, for end-to-end tests.
 *
 * Why this exists rather than testing against live: the two failure modes the
 * booking flow most needs to get right — sold out mid-checkout, and a hold that
 * expired — cannot be produced on demand against the real API without actually
 * selling out a departure. There is also no sandbox account for this key pair
 * (sandbox-api.regiondo.com rejects the live keys with 403), so a mock is the
 * only way to exercise them at all.
 *
 * Every response shape here was copied from a real captured response, including
 * the four places the OpenAPI document is wrong:
 *   - reservation_data is a single object on POST/PUT /checkout/hold
 *   - totals.tax is {title, value}
 *   - /checkout/checkoutlink returns an object
 *   - buyer_data_required entries carry no view_type
 * If the wrapper stops handling those, these tests fail — which is the point.
 *
 * Scenario switching is by header (`x-mock-scenario`) or by a control endpoint,
 * so a test can flip the world between two page loads.
 *
 *     node e2e/mock-regiondo.mjs [port]
 */

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "..", "lib", "regiondo", "__tests__", "fixtures");
const load = (name) => JSON.parse(readFileSync(join(fixtures, `${name}.json`), "utf8"));

const PRODUCTS = load("products-list");
const PRODUCT_DETAIL = load("product-detail");
const TAGS = load("tags");
const REVIEWS = load("reviews");
const AVAILOPTIONS = load("availoptions");
const HOLD = load("hold-response");
const TOTALS = load("checkout-totals");
const CHECKOUT_LINK = load("checkout-link");
const PURCHASE = load("purchase");

/** Mutable so a test can move the world between requests. */
let scenario = "happy";

/** Dates the mock is always available on, so tests never depend on today. */
function availability() {
  const out = {};
  for (let i = 7; i < 21; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + i);
    out[d.toISOString().slice(0, 10)] = [["08:00:00"]];
  }
  return out;
}

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  const active = req.headers["x-mock-scenario"] ?? scenario;

  // Control plane for the tests.
  if (path === "/__scenario") {
    scenario = url.searchParams.get("name") ?? "happy";
    return json(res, 200, { scenario });
  }

  // --- catalog -----------------------------------------------------------
  if (path === "/v1/tags") return json(res, 200, TAGS);
  if (path === "/v1/products") return json(res, 200, PRODUCTS);
  if (path.startsWith("/v1/products/availabilities/")) {
    // Sold out means an empty calendar as well as no options, so the panel has
    // nothing to offer rather than offering something it cannot hold.
    return json(res, 200, { data: active === "soldout" ? {} : availability() });
  }
  if (path.startsWith("/v1/products/availoptions/")) {
    if (active === "soldout") {
      const sold = structuredClone(AVAILOPTIONS);
      for (const option of Object.values(sold.data)) option.qty_left = 0;
      return json(res, 200, sold);
    }
    return json(res, 200, AVAILOPTIONS);
  }
  if (path === "/v1/reviews") return json(res, 200, REVIEWS);
  if (path.startsWith("/v1/products/")) return json(res, 200, PRODUCT_DETAIL);

  // --- checkout ----------------------------------------------------------
  if (path === "/v1/checkout/hold") {
    if (req.method === "POST") {
      if (active === "soldout") {
        // HTTP 202 with the reason in the body — the Checkout API's own idiom.
        return json(res, 202, {
          data: {
            result: "stock_not_available",
            message: "Requested quantity is not available",
            available_items: [],
            not_available_items: [{ product_id: 298190, qty: 1 }],
          },
        });
      }
      const hold = structuredClone(HOLD);
      hold.reservation_data.reservation_code = `mock-${Date.now()}`;
      // Local wall-clock time in `timezone`, exactly as the real API reports it.
      const end = new Date(Date.now() + 20 * 60_000);
      hold.reservation_data.reservation_end = `${end.toISOString().slice(0, 10)} ${end
        .toISOString()
        .slice(11, 16)}`;
      hold.reservation_data.timezone = "UTC";
      return json(res, 200, hold);
    }
    if (req.method === "DELETE") return json(res, 200, { result: "ok" });
    if (req.method === "PUT") {
      if (active === "expired") {
        return json(res, 202, {
          data: { result: "reservation_not_found", message: "Reservation not found" },
        });
      }
      return json(res, 200, { reservation_data: HOLD.reservation_data, date_time: "" });
    }
    return json(res, 200, { data: [] });
  }

  if (path === "/v1/checkout/totals") {
    if (active === "expired") {
      return json(res, 202, {
        data: { result: "reservation_not_found", message: "Reservation not found" },
      });
    }
    if (active === "pricechange") {
      const changed = structuredClone(TOTALS);
      changed.totals.grand_total = 199;
      return json(res, 200, changed);
    }
    return json(res, 200, TOTALS);
  }

  if (path === "/v1/checkout/checkoutlink") return json(res, 200, CHECKOUT_LINK);

  if (path === "/v1/checkout/purchase") {
    const wanted = url.searchParams.get("order_number");
    if (wanted !== PURCHASE.order_number) {
      return json(res, 200, { code: 404, message: "Not Found" });
    }
    return json(res, 200, PURCHASE);
  }

  if (path === "/v1/account/currency") return json(res, 200, load("account-currency"));

  return json(res, 404, { code: 404, message: `mock has no route for ${path}` });
});

const port = Number(process.argv[2] ?? 4010);
server.listen(port, () => {
  console.log(`mock regiondo listening on http://localhost:${port}`);
});
