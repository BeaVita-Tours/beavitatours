import { z } from "zod";

const EU_VAT_REGEXES: Record<string, RegExp> = {
  AT: /^ATU\d{8}$/,
  BE: /^BE0\d{9}$/,
  BG: /^BG\d{9,10}$/,
  CY: /^CY\d{8}[A-Z]$/,
  CZ: /^CZ\d{8,10}$/,
  DE: /^DE\d{9}$/,
  DK: /^DK\d{8}$/,
  EE: /^EE\d{9}$/,
  EL: /^EL\d{9}$/,
  ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
  FI: /^FI\d{8}$/,
  FR: /^FR[A-Z0-9]{2}\d{9}$/,
  HR: /^HR\d{11}$/,
  HU: /^HU\d{8}$/,
  IE: /^IE\d{7}[A-W]$/,
  IT: /^IT\d{11}$/,
  LT: /^LT(\d{9}|\d{12})$/,
  LU: /^LU\d{8}$/,
  LV: /^LV\d{11}$/,
  MT: /^MT\d{8}$/,
  NL: /^NL\d{9}B\d{2}$/,
  PL: /^PL\d{10}$/,
  PT: /^PT\d{9}$/,
  RO: /^RO\d{2,10}$/,
  SE: /^SE\d{10}01$/,
  SI: /^SI\d{8}$/,
  SK: /^SK\d{10}$/,
};

function normalizeVatInput(input: string) {
  const compact = input
    .trim()
    .toUpperCase()
    .replace(/[\s\-\.\/]/g, "");
  // Allow Italy VAT pasted as just 11 digits.
  if (/^\d{11}$/.test(compact)) return `IT${compact}`;
  return compact;
}

function isValidEUVatNumber(vat: string): boolean {
  const countryCode = vat.slice(0, 2).toUpperCase();
  const numberPart = vat.slice(2);

  const regex = EU_VAT_REGEXES[countryCode];
  if (!regex) return false;
  if (!regex.test(vat)) return false;

  if (countryCode === "IT") {
    let sum = 0;
    for (let i = 0; i < 10; i += 1) {
      const digit = Number(numberPart[i]);
      if (Number.isNaN(digit)) return false;
      if (i % 2 === 0) sum += digit;
      else sum += digit * 2 > 9 ? digit * 2 - 9 : digit * 2;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === Number(numberPart[10]);
  }

  return true;
}

export const travelAgencyLeadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().min(2).max(120),
  vatNumber: z
    .string()
    .transform(normalizeVatInput)
    .refine(isValidEUVatNumber, {
      message: "Invalid EU VAT number.",
    }),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(254),
  companyAddress: z.string().trim().min(5).max(500),
  website: z.string().trim().optional(),
});

export type TravelAgencyLeadInput = z.infer<typeof travelAgencyLeadSchema>;
