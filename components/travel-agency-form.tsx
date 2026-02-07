"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type TravelAgencyLeadInput,
  travelAgencyLeadSchema,
} from "@/lib/travel-agency";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Asterisk } from "lucide-react";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputClassName =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const textareaClassName =
  "flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function MandatoryAsterisk() {
  return <Asterisk className="inline-block w-3.5 h-3.5 text-primary" />;
}

export function TravelAgencyForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const defaultValues = useMemo<TravelAgencyLeadInput>(
    () => ({
      fullName: "",
      companyName: "",
      vatNumber: "",
      phone: "",
      email: "",
      message: "",
      website: "",
    }),
    []
  );

  const form = useForm<TravelAgencyLeadInput>({
    resolver: zodResolver(travelAgencyLeadSchema),
    defaultValues,
    mode: "onTouched",
  });

  async function onSubmit(values: TravelAgencyLeadInput) {
    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/travel-agency", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (!response.ok) {
        setSubmitState({
          status: "error",
          message:
            data?.message ??
            "Something went wrong while sending your request. Please try again.",
        });
        return;
      }

      setSubmitState({
        status: "success",
        message: data?.message ?? "Thanks — we received your details.",
      });
      form.reset(defaultValues);
    } catch {
      setSubmitState({
        status: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  const isSubmitting = submitState.status === "submitting";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Contact details</CardTitle>
        <CardDescription>
          Fields marked with <MandatoryAsterisk /> are required.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <CardContent className="mb-4">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full name <MandatoryAsterisk />
              </label>
              <input
                id="fullName"
                autoComplete="name"
                className={inputClassName}
                placeholder="Your full name"
                aria-invalid={!!form.formState.errors.fullName}
                disabled={isSubmitting}
                {...form.register("fullName")}
              />
              <p className="min-h-5 text-sm text-destructive">
                {form.formState.errors.fullName?.message ?? "\u00A0"}
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Company name
              </label>
              <input
                id="companyName"
                autoComplete="organization"
                className={inputClassName}
                placeholder="Company / agency name"
                aria-invalid={!!form.formState.errors.companyName}
                disabled={isSubmitting}
                {...form.register("companyName")}
              />
              <p className="min-h-5 text-sm text-destructive">
                {form.formState.errors.companyName?.message ?? "\u00A0"}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <label htmlFor="vatNumber" className="text-sm font-medium">
                  EU VAT number <span className="text-muted-foreground">(P. IVA)</span>
                </label>
                <input
                  id="vatNumber"
                  className={inputClassName}
                  placeholder="VAT number"
                  aria-invalid={!!form.formState.errors.vatNumber}
                  disabled={isSubmitting}
                  {...form.register("vatNumber")}
                />
                <p className="min-h-5 text-sm text-destructive">
                  {form.formState.errors.vatNumber?.message ?? "\u00A0"}
                </p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone number <MandatoryAsterisk />
                </label>
                <input
                  id="phone"
                  autoComplete="tel"
                  className={inputClassName}
                  placeholder="Phone number"
                  aria-invalid={!!form.formState.errors.phone}
                  disabled={isSubmitting}
                  {...form.register("phone")}
                />
                <p className="min-h-5 text-sm text-destructive">
                  {form.formState.errors.phone?.message ?? "\u00A0"}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail <MandatoryAsterisk />
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={inputClassName}
                placeholder="name@company.com"
                aria-invalid={!!form.formState.errors.email}
                disabled={isSubmitting}
                {...form.register("email")}
              />
              <p className="min-h-5 text-sm text-destructive">
                {form.formState.errors.email?.message ?? "\u00A0"}
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message <MandatoryAsterisk />
              </label>
              <textarea
                id="message"
                className={textareaClassName}
                placeholder="Write your message here"
                aria-invalid={!!form.formState.errors.message}
                disabled={isSubmitting}
                {...form.register("message")}
              />
              <p className="min-h-5 text-sm text-destructive">
                {form.formState.errors.message?.message ?? "\u00A0"}
              </p>
            </div>

            <input
              tabIndex={-1}
              autoComplete="off"
              className={cn("hidden")}
              aria-hidden="true"
              {...form.register("website")}
            />

            {submitState.status === "success" ? (
              <div className="rounded-xl border px-4 py-3 text-sm">
                {submitState.message}
              </div>
            ) : null}
            {submitState.status === "error" ? (
              <div className="rounded-xl border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {submitState.message}
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
