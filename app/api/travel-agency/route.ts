import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/rate-limit";
import { travelAgencyLeadSchema } from "@/lib/travel-agency";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function buildLeadEmailText(data: z.infer<typeof travelAgencyLeadSchema>) {
  return [
    "New travel agency enquiry",
    "",
    `Full name: ${data.fullName}`,
    `Company name: ${data.companyName}`,
    `VAT number: ${data.vatNumber}`,
    `Phone: ${data.phone}`,
    `E-mail: ${data.email}`,
    "",
    "Company address:",
    data.companyAddress,
  ].join("\n");
}

async function sendEmailStub(params: {
  to: string;
  subject: string;
  text: string;
}) {
  await resend.emails.send({
    from: `BeaVitaTours Form <${process.env.TRAVEL_AGENCY_FROM_EMAIL}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
  });

  console.info("[travel-agency] email stub", {
    to: params.to,
    subject: params.subject,
    textLength: params.text.length,
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  const ipLimit = consumeRateLimit(`travel-agency:ip:${ip}`, {
    windowMs: 10 * 60 * 1000,
    max: 5,
  });
  const globalLimit = consumeRateLimit("travel-agency:global", {
    windowMs: 60 * 1000,
    max: 30,
  });

  if (!ipLimit.ok || !globalLimit.ok) {
    const resetAt = Math.max(ipLimit.resetAt, globalLimit.resetAt);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((resetAt - Date.now()) / 1000)
    );
    return NextResponse.json(
      {
        ok: false,
        message: "Too many requests. Please try again shortly.",
      },
      {
        status: 429,
        headers: {
          "retry-after": String(retryAfterSeconds),
        },
      }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = travelAgencyLeadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please check the form fields and try again.",
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Basic bot protection: treat honeypot fills as success.
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true, message: "Thanks — received." });
  }

  const inbox = process.env.TRAVEL_AGENCY_INBOX_EMAIL;
  if (!inbox) {
    return NextResponse.json(
      {
        ok: false,
        message: "Server is not configured to receive enquiries.",
      },
      { status: 500 }
    );
  }

  const email = {
    to: inbox,
    subject: `Travel agency enquiry — ${data.companyName}`,
    text: buildLeadEmailText(data),
  };

  await sendEmailStub(email);

  return NextResponse.json({
    ok: true,
    message: "Thanks — we received your details.",
  });
}
