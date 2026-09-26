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
 * The departure on offer has two participant tiers (Adult, Young 7-14 — the
 * live shape of product 300877) and its own seat count from `/products/
 * timeslots`, lower than either tier's stock, so the tests can book a real
 * party and prove the coach's capacity — not the tier's — is the limit. Every
 * hold the mock receives is recorded and readable at `/__holds`, which is how
 * a test proves that "2 Adults + 2 Young" reached the API as two holds with
 * the right quantities and one checkout link across both.
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
const AVAILOPTIONS = load("availoptions-tiers");
const TIMESLOTS = load("timeslots");
/**
 * The departure's own seat count, deliberately below both tiers' `qty_left`
 * (22 and 49): live, the event number is the one that actually limits a
 * booking (a real Cortina departure showed 33 per tier and 9 for the coach),
 * and the suite must prove the panel respects it.
 */
const EVENT_SEATS = 9;
const HOLD = load("hold-response");
const TOTALS = load("checkout-totals");
const CHECKOUT_LINK = load("checkout-link");
const PURCHASE = load("purchase");

/** Mutable so a test can move the world between requests. */
let scenario = "happy";

/** Every hold placed since the last scenario switch, oldest first. */
let holds = [];
/** The reservation codes each checkout-link request was asked for. */
let checkoutLinks = [];
let nextHoldId = 74600000;

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

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

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  const active = req.headers["x-mock-scenario"] ?? scenario;

  // Control plane for the tests.
  if (path === "/__scenario") {
    scenario = url.searchParams.get("name") ?? "happy";
    holds = [];
    checkoutLinks = [];
    return json(res, 200, { scenario });
  }
  if (path === "/__holds") return json(res, 200, { holds, checkoutLinks });

  // --- catalog -----------------------------------------------------------
  if (path === "/v1/tags") return json(res, 200, TAGS);
  if (path === "/v1/products") {
    let data = PRODUCTS.data;

    // The two collections. The fixture products carry no tag data, but the
    // real account's split is exactly the "(PRIVATE)" suffix in the name, so
    // that is what stands in for the tag here. Ids from fixtures/tags.json.
    const tag = url.searchParams.get("tag");
    if (tag === "45420") data = data.filter((p) => !/\(PRIVATE\)/i.test(p.name));
    if (tag === "45421") data = data.filter((p) => /\(PRIVATE\)/i.test(p.name));

    // Curated sets (theme upsells, landing pages) filter by id.
    const ids = url.searchParams.get("product_ids");
    if (ids) {
      const wanted = new Set(ids.split(","));
      data = data.filter((p) => wanted.has(String(p.product_id)));
    }

    // Keyword search, so the "pre-filtered catalog" assertion means something.
    // The real API matches name and description, case-insensitively.
    const kwd = url.searchParams.get("kwd");
    if (kwd) {
      const needle = kwd.toLowerCase();
      data = data.filter((p) =>
        `${p.name} ${p.short_description ?? ""} ${p.description ?? ""}`
          .toLowerCase()
          .includes(needle)
      );
    }

    return json(res, 200, { ...PRODUCTS, data });
  }
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
  if (path === "/v1/products/timeslots") {
    // One slot per requested day at 08:00, with the departure-wide count.
    const from = (url.searchParams.get("from_datetime") ?? "").slice(0, 10);
    const slot = structuredClone(TIMESLOTS.data[0]);
    slot.start_date_time = `${from} 08:00:00`;
    slot.qty_available = active === "soldout" ? 0 : EVENT_SEATS;
    slot.is_available = active === "soldout" ? 0 : 1;
    return json(res, 200, { ...TIMESLOTS, data: [slot] });
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
      const body = await readBody(req);
      const hold = structuredClone(HOLD);
      const code = `mock-${nextHoldId++}`;
      hold.reservation_data.reservation_code = code;
      // Echo the item back, as the real API does — one hold is one option.
      hold.reservation_data.product_id = String(body.product_id ?? "");
      hold.reservation_data.option_id = String(body.option_id ?? "");
      hold.reservation_data.qty = Number(body.qty ?? 1);
      // Local wall-clock time in `timezone`, exactly as the real API reports it.
      const end = new Date(Date.now() + 20 * 60_000);
      hold.reservation_data.reservation_end = `${end.toISOString().slice(0, 10)} ${end
        .toISOString()
        .slice(11, 16)}`;
      hold.reservation_data.timezone = "UTC";
      holds.push({
        code,
        product_id: String(body.product_id ?? ""),
        option_id: String(body.option_id ?? ""),
        qty: Number(body.qty ?? 1),
        date_time: body.date_time ?? "",
        released: false,
      });
      return json(res, 200, hold);
    }
    if (req.method === "DELETE") {
      const code = url.searchParams.get("reservation_code");
      for (const hold of holds) if (hold.code === code) hold.released = true;
      return json(res, 200, { result: "ok" });
    }
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

  if (path === "/v1/checkout/checkoutlink") {
    // "Single or comma-separated reservation codes": one link for the basket.
    const codes = (url.searchParams.get("reservation_code") ?? "").split(",").filter(Boolean);
    checkoutLinks.push(codes);
    const link = structuredClone(CHECKOUT_LINK);
    link.data.reservation_code = codes.join(",");
    link.data.checkout_link = `https://prosecco-experience.regiondo.com/checkout/apireservation/index/keys/${codes.join(",")}/currency/eur`;
    return json(res, 200, link);
  }

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
