import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  privacyPolicies,
  privacyPolicyLanguages,
  resolvePrivacyPolicyLanguage,
} from "@/lib/privacy-policy";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const selectedLanguage = resolvePrivacyPolicyLanguage(locale);
  const policy = privacyPolicies[selectedLanguage];

  return {
    title: `${policy.title} | BEA VITA TOURS`,
    description: policy.subtitle,
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const selectedLanguage = resolvePrivacyPolicyLanguage(locale);
  const policy = privacyPolicies[selectedLanguage];

  return (
    <main className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                {policy.title}
              </h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                {policy.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>
                {policy.versionLabel} <strong>{policy.version}</strong>
              </span>
              <span>
                {policy.lastUpdatedLabel} <strong>{policy.lastUpdated}</strong>
              </span>
            </div>
          </header>

          <Card className="border-border/60">
            <CardContent className="space-y-8 pt-6">
              {policy.sections.map((section) => (
                <section key={section.heading} className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="leading-7 text-muted-foreground text-pretty"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="leading-7">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <section className="rounded-xl border bg-muted/30 p-4">
                <h2 className="text-lg font-semibold">{policy.contactLabel}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {policy.contactValue}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {policy.consentNote}
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
