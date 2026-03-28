"use client"

import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, Shield } from "lucide-react"

export default function RatesPage() {
  const t = useTranslations("rates")
  
  return (
    <main>
      {/* Hero Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent uppercase text-accent-foreground border-0">
              {t("badge")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Prominent Two-Column Rates Split (primary section) */}
      <section className="py-20 bg-linear-to-r from-accent/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-stretch md:divide-x-2 md:divide-primary/10 bg-card rounded-lg shadow-lg overflow-hidden">
              {/* Left - Shared Tour CTA */}
              <div className="md:w-1/2 px-8 py-12 text-center md:text-left bg-white/0">
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                  {t("sharedTourTitle")}
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  {t("sharedTourDesc")}
                </p>
                <div className="mt-6">
                  <Button asChild size="lg">
                    <Link href="/tours/shared-tours">{t("bookSharedTour")}</Link>
                  </Button>
                </div>
              </div>

              {/* Right - Private Tour Rates (emphasized) */}
              <div className="md:w-1/2 px-8 py-12 bg-primary/5">
                <h3 className="text-2xl md:text-3xl font-semibold mb-6">
                  {t("privateTourTitle")}
                </h3>
                <ul className="space-y-6 mb-6">
                  <li className="flex justify-between items-center">
                    <span className="text-lg md:text-xl">{t("halfDay")}</span>
                    <span className="text-2xl md:text-4xl font-extrabold text-primary">
                      €600
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-lg md:text-xl">{t("fullDay")}</span>
                    <span className="text-2xl md:text-4xl font-extrabold text-primary">
                      €900
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-lg md:text-xl">{t("multiDay")}</span>
                    <span className="text-lg md:text-2xl font-semibold">
                      {t("priceOnRequest")}
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-lg md:text-xl">{t("tailorMade")}</span>
                    <span className="text-lg md:text-2xl font-semibold">
                      {t("priceOnRequest")}
                    </span>
                  </li>
                </ul>

                <p className="text-sm text-muted-foreground">
                  {t("privateTourNotes")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-linear-to-r from-accent/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    {t("whatsIncludedTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {t("whatsIncludedItem1")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {t("whatsIncludedItem2")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {t("whatsIncludedItem3")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {t("whatsIncludedItem4")}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <X className="h-5 w-5 text-muted-foreground" />
                    {t("excludedTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {t("excludedItem1")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {t("excludedItem2")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {t("excludedItem3")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {t("excludedItem4")}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Best Price Guarantee */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t("bestValueTitle")}</h2>
          </div>
        </div>
      </section>
    </main>
  );
}
