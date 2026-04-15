"use client";

import Image from "next/image";
import { RegiondoWidget } from "@/components/landing/regiondo-widget";
import {
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  Mountain,
  ShieldCheck,
  Star,
  Wine,
  Users,
} from "lucide-react";

const bookingUrl =
  "https://www.getyourguide.com/it-it/comune-di-valdobbiadene-l153536/da-venezia-escursione-di-un-giorno-nelle-regioni-del-vino-amarone-e-prosecco-t852142/";

const highlights = [
  {
    icon: Mountain,
    text: "Follow a scenic UNESCO route through the Prosecco Hills, with time to stop rather than rush past.",
  },
  {
    icon: Wine,
    text: "Taste local wines at a family-run winery and keep the atmosphere relaxed and personal.",
  },
  {
    icon: ShieldCheck,
    text: "Book with confidence through live availability and a simple, mobile-friendly flow.",
  },
  {
    icon: Users,
    text: "Designed for small groups, with a pace that feels easy from Venice to Asolo.",
  },
];

const included = [
  "Pickup and return from Piazzale Roma, Venice",
  "Comfortable air-conditioned transport",
  "Guide and group coordination",
  "Scenic drive through the Prosecco Hills",
  "Guided winery visit and tasting",
  "Four Valdobbiadene Prosecco DOCG wines",
  "Light lunch with local cheese and cured meats",
  "Aperol Spritz aperitivo with snacks",
  "Free time in Asolo",
];

const notIncluded = ["Hotel transfer", "Gratuities"];

const itinerary = [
  {
    dot: "→",
    title: "Meeting point: Piazzale Roma",
    text: "Start in Venice and leave the city behind in comfort.",
    time: "Start",
  },
  {
    dot: "1",
    title: "Osteria Senz'Oste",
    text: "A scenic stop for photos and a first look over the hills.",
    time: "20 min",
  },
  {
    dot: "2",
    title: "Valdobbiadene",
    text: "Winery visit, tasting, and a proper taste of the region.",
    time: "1 h 45 min",
  },
  {
    dot: "3",
    title: "Prosecco Hills viewpoint",
    text: "Aperitivo with a view: Spritz, snacks, and a slow moment.",
    time: "20 min",
  },
  {
    dot: "4",
    title: "Asolo",
    text: "Time to wander one of Italy’s prettiest hill towns.",
    time: "1 h 30 min",
  },
  {
    dot: "⌂",
    title: "Return to Venice",
    text: "Head back to Piazzale Roma after an easy full day out.",
    time: "End",
  },
];

const practicalInfo = [
  { label: "Meeting point", value: "Piazzale Roma, Venice" },
  { label: "Duration", value: "About 7 hours" },
  { label: "What to bring", value: "Comfortable shoes and a camera" },
  { label: "Minimum age", value: "14 years" },
];

const reviews = [
  {
    name: "Michael",
    meta: "United States · April 2026",
    text: "The van was comfortable, the guide was excellent, and the winery stop was the highlight.",
  },
  {
    name: "Martin",
    meta: "United Kingdom · April 2026",
    text: "Fabulous trip, well organised, great guide and host. Highly recommended.",
  },
  {
    name: "Amy M.",
    meta: "International · March 2026",
    text: "A brilliant day in the Prosecco hills. Great pace, great views, and great value.",
    reply:
      "Thank you so much — we’re glad the day felt special from the first stop to the last.",
  },
  {
    name: "Keith W.",
    meta: "International · February 2026",
    text: "The views were stunning and the small group made it feel almost private.",
  },
];

const photoTiles = [
  { src: "/tourwines.jpg", alt: "Wine tasting in the hills" },
  { src: "/tourprosecco.jpg", alt: "Prosecco hills" },
  { src: "/shared.jpg", alt: "Shared tour landscape" },
  { src: "/bdlogo.jpg", alt: "Bea Vita Tours logo" },
  { src: "/logo-symbol.webp", alt: "Bea Vita Tours symbol" },
];

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <style jsx global>{`
        .landing-shell {
          --cyan: #c9a84c;
          --cyan-light: #e8d4a0;
          --pink: #c9a84c;
          --pink-light: #faf4e6;
          --dark: #1a1209;
          --dark-mid: #2e2210;
          --body: #3d3020;
          --muted: #7a6a52;
          --border: rgba(201, 168, 76, 0.22);
          --green-ok: #2d7a4f;
          --white: #fffdf7;
          --serif: "Playfair Display", Georgia, serif;
          --sans: "DM Sans", sans-serif;
          max-width: 480px;
          margin: 0 auto;
          background: var(--white);
          color: var(--body);
          font-family: var(--sans);
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          padding-bottom: 92px;
          position: relative;
        }

        .landing-shell * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .landing-shell .trust-bar {
          background: rgba(26, 18, 9, 0.92);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          backdrop-filter: blur(12px);
        }

        .landing-shell .brand-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .landing-shell .brand-name {
          font-family: var(--serif);
          color: var(--cyan);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .landing-shell .trust-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .landing-shell .badge-portal {
          font-size: 10px;
          padding: 3px 7px;
          border-radius: 4px;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-decoration: none;
          color: white;
          white-space: nowrap;
        }

        .landing-shell .badge-gyg {
          background: #ff5533;
        }

        .landing-shell .badge-viator {
          background: #1a5276;
        }

        .landing-shell .stars-mini {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: var(--cyan-light);
        }

        .landing-shell .stars-mini .s {
          color: var(--cyan);
          font-size: 12px;
        }

        .landing-shell .gallery {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
          background: var(--dark);
        }

        .landing-shell .gallery-main {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .landing-shell .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(18, 26, 43, 0) 40%,
            rgba(18, 26, 43, 0.75) 100%
          );
        }

        .landing-shell .gallery-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(201, 168, 76, 0.92);
          color: var(--dark);
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }

        .landing-shell .gallery-thumbs {
          position: absolute;
          bottom: 10px;
          right: 10px;
          display: flex;
          gap: 4px;
        }

        .landing-shell .gallery-thumbs img,
        .landing-shell .thumb-placeholder {
          width: 48px;
          height: 36px;
          object-fit: cover;
          border-radius: 4px;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
          opacity: 0.92;
        }

        .landing-shell .thumb-placeholder {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          background: #1a1209;
        }

        .landing-shell .gallery-count {
          position: absolute;
          bottom: 10px;
          left: 12px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.92);
          background: rgba(17, 24, 39, 0.4);
          padding: 3px 8px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }

        .landing-shell .hero-info {
          padding: 20px 16px 0;
          background: var(--white);
        }

        .landing-shell .hero-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .landing-shell .meta-chip {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
          border: 0.5px solid var(--border);
          padding: 3px 8px;
          border-radius: 20px;
          background: white;
        }

        .landing-shell .meta-chip .icon {
          font-size: 12px;
          color: var(--cyan);
        }

        .landing-shell .hero-title {
          font-family: var(--serif);
          font-size: 22px;
          font-weight: 700;
          color: var(--dark);
          line-height: 1.25;
          margin-bottom: 10px;
        }

        .landing-shell .rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .landing-shell .star-row {
          display: flex;
          gap: 1px;
          color: var(--cyan);
        }

        .landing-shell .star-row span {
          font-size: 16px;
        }

        .landing-shell .rating-num {
          font-weight: 600;
          color: var(--dark);
          font-size: 15px;
        }

        .landing-shell .rating-count {
          color: var(--muted);
          font-size: 13px;
        }

        .landing-shell .rating-award {
          font-size: 10px;
          background: var(--cyan-light);
          color: #7a5c00;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 500;
          border: 0.5px solid var(--cyan-light);
        }

        .landing-shell .booking-box {
          margin: 14px 16px;
          background: var(--dark);
          border-radius: 14px;
          padding: 18px;
          color: var(--white);
        }

        .landing-shell .booking-urgency {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #ff8c42;
          font-weight: 500;
          margin-bottom: 12px;
          background: rgba(255, 140, 66, 0.12);
          padding: 4px 10px;
          border-radius: 20px;
          border: 0.5px solid rgba(255, 140, 66, 0.3);
        }

        .landing-shell .booking-urgency::before {
          content: "🔥";
          font-size: 12px;
        }

        .landing-shell .price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .landing-shell .price-old {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.55);
          text-decoration: line-through;
        }

        .landing-shell .price-new {
          font-family: var(--serif);
          font-size: 32px;
          color: var(--cyan);
          font-weight: 700;
          line-height: 1;
        }

        .landing-shell .price-per {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
          align-self: flex-end;
        }

        .landing-shell .price-discount {
          font-size: 11px;
          background: var(--cyan);
          color: var(--dark);
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 600;
          margin-left: auto;
          align-self: flex-start;
        }

        .landing-shell .booking-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .landing-shell .b-input {
          background: rgba(255, 255, 255, 0.07);
          border: 0.5px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .landing-shell .b-input:active {
          border-color: var(--cyan);
        }

        .landing-shell .b-input-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.55);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 3px;
        }

        .landing-shell .b-input-val {
          font-size: 13px;
          color: var(--white);
          font-weight: 500;
        }

        .landing-shell .b-input-val.placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .landing-shell .btn-book {
          width: 100%;
          background: var(--cyan);
          color: var(--dark);
          border: none;
          border-radius: 10px;
          padding: 16px;
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition:
            opacity 0.2s,
            transform 0.15s;
          margin-bottom: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
        }

        .landing-shell .btn-book:active {
          opacity: 0.9;
          transform: scale(0.99);
        }

        .landing-shell .booking-reassurances {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .landing-shell .reassurance-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.78);
        }

        .landing-shell .reassurance-item .check {
          color: var(--cyan);
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .landing-shell .section {
          padding: 20px 16px;
          border-top: 0.5px solid var(--border);
        }

        .landing-shell .section-title {
          font-family: var(--serif);
          font-size: 17px;
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 14px;
        }

        .landing-shell .highlights-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .landing-shell .highlight-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background: var(--cyan-light);
          border-radius: 10px;
          border-left: 3px solid var(--cyan);
        }

        .landing-shell .highlight-icon {
          font-size: 18px;
          flex-shrink: 0;
          color: var(--dark);
        }

        .landing-shell .highlight-text {
          font-size: 13px;
          color: var(--body);
          line-height: 1.4;
        }

        .landing-shell .included-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .landing-shell .inc-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
        }

        .landing-shell .inc-item .ok {
          color: var(--green-ok);
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .landing-shell .inc-item .no {
          color: #c0392b;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .landing-shell .inc-divider {
          height: 0.5px;
          background: var(--border);
          margin: 10px 0;
        }

        .landing-shell .inc-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--muted);
          font-weight: 500;
          margin-bottom: 8px;
        }

        .landing-shell .itinerary {
          display: flex;
          flex-direction: column;
        }

        .landing-shell .itin-step {
          display: flex;
          gap: 12px;
          padding-bottom: 16px;
          position: relative;
        }

        .landing-shell .itin-step:last-child {
          padding-bottom: 0;
        }

        .landing-shell .itin-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 28px;
        }

        .landing-shell .itin-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
          z-index: 1;
        }

        .landing-shell .itin-dot.start {
          background: var(--dark);
          color: var(--cyan);
        }

        .landing-shell .itin-dot.stop {
          background: var(--cyan-light);
          color: var(--dark);
          border: 1.5px solid var(--cyan);
        }

        .landing-shell .itin-dot.end {
          background: var(--cyan);
          color: var(--dark);
        }

        .landing-shell .itin-line {
          width: 1.5px;
          flex: 1;
          background: var(--border);
          margin-top: 2px;
          min-height: 20px;
        }

        .landing-shell .itin-right {
          flex: 1;
          padding-top: 2px;
        }

        .landing-shell .itin-name {
          font-weight: 500;
          font-size: 14px;
          color: var(--dark);
          margin-bottom: 2px;
        }

        .landing-shell .itin-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.4;
        }

        .landing-shell .itin-time {
          display: inline-block;
          margin-top: 4px;
          font-size: 11px;
          background: rgba(34, 211, 238, 0.12);
          color: #0f766e;
          padding: 2px 8px;
          border-radius: 20px;
          border: 0.5px solid rgba(34, 211, 238, 0.24);
        }

        .landing-shell .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .landing-shell .info-card {
          background: var(--cyan-light);
          border-radius: 10px;
          padding: 12px;
          border: 0.5px solid var(--border);
        }

        .landing-shell .info-card-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .landing-shell .info-card-val {
          font-size: 13px;
          font-weight: 500;
          color: var(--dark);
          line-height: 1.3;
        }

        .landing-shell .info-full {
          background: var(--cyan-light);
          border-radius: 10px;
          padding: 12px;
          border: 0.5px solid var(--border);
          margin-bottom: 8px;
          font-size: 13px;
          color: var(--body);
        }

        .landing-shell .info-full strong {
          color: var(--dark);
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--muted);
          margin-bottom: 4px;
          font-weight: 500;
        }

        .landing-shell .review-agg {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 16px;
          padding: 14px;
          background: var(--cyan-light);
          border-radius: 12px;
          border: 0.5px solid var(--border);
        }

        .landing-shell .review-score {
          text-align: center;
          flex-shrink: 0;
        }

        .landing-shell .review-score .big {
          font-family: var(--serif);
          font-size: 42px;
          font-weight: 700;
          color: var(--dark);
          line-height: 1;
        }

        .landing-shell .review-score .out {
          font-size: 12px;
          color: var(--muted);
        }

        .landing-shell .review-right {
          flex: 1;
        }

        .landing-shell .review-bar-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 11px;
          color: var(--muted);
        }

        .landing-shell .review-bar-label {
          width: 70px;
          flex-shrink: 0;
        }

        .landing-shell .review-bar-track {
          flex: 1;
          height: 4px;
          background: rgba(201, 168, 76, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .landing-shell .review-bar-fill {
          height: 100%;
          background: var(--cyan);
          border-radius: 2px;
        }

        .landing-shell .review-bar-num {
          width: 24px;
          text-align: right;
          flex-shrink: 0;
        }

        .landing-shell .community-photos {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 4px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .landing-shell .community-photos img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
        }

        .landing-shell .community-photos .photo-more {
          background: var(--dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          color: var(--cyan);
          aspect-ratio: 1;
        }

        .landing-shell .review-card {
          padding: 14px;
          border: 0.5px solid var(--border);
          border-radius: 12px;
          margin-bottom: 10px;
          background: var(--white);
        }

        .landing-shell .review-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .landing-shell .reviewer-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--dark);
          color: var(--cyan);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
          font-family: var(--serif);
        }

        .landing-shell .reviewer-name {
          font-weight: 500;
          font-size: 13px;
          color: var(--dark);
        }

        .landing-shell .reviewer-meta {
          font-size: 11px;
          color: var(--muted);
        }

        .landing-shell .review-stars {
          display: flex;
          gap: 1px;
          margin-bottom: 6px;
          color: var(--cyan);
        }

        .landing-shell .review-stars span {
          font-size: 13px;
        }

        .landing-shell .review-text {
          font-size: 13px;
          color: var(--body);
          line-height: 1.5;
        }

        .landing-shell .review-provider-reply {
          margin-top: 10px;
          padding: 10px 12px;
          background: var(--cyan-light);
          border-radius: 8px;
          border-left: 2px solid var(--cyan);
          font-size: 12px;
          color: var(--muted);
        }

        .landing-shell .review-provider-reply strong {
          color: var(--dark);
          font-size: 11px;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .landing-shell .description-text {
          font-size: 14px;
          color: var(--body);
          line-height: 1.7;
        }

        .landing-shell .description-text p + p {
          margin-top: 10px;
        }

        .landing-shell .sticky-cta {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 480px;
          background: rgba(26, 18, 9, 0.94);
          border-top: 0.5px solid var(--border);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 100;
          box-shadow: 0 -8px 24px rgba(26, 18, 9, 0.08);
          backdrop-filter: blur(12px);
        }

        .landing-shell .sticky-price {
          flex: 1;
        }

        .landing-shell .sticky-price-old {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: line-through;
        }

        .landing-shell .sticky-price-new {
          font-family: var(--serif);
          font-size: 20px;
          font-weight: 700;
          color: var(--cyan);
          line-height: 1.1;
        }

        .landing-shell .sticky-price-per {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
        }

        .landing-shell .btn-sticky {
          background: var(--cyan);
          color: var(--dark);
          border: none;
          border-radius: 10px;
          padding: 13px 20px;
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
        }

        .landing-shell .bottom-spacer {
          height: 80px;
        }

        .landing-shell .photo-bg-1 {
          background: linear-gradient(135deg, #7a9e6f 0%, #4a7d5e 100%);
        }

        .landing-shell .photo-bg-2 {
          background: linear-gradient(135deg, var(--cyan) 0%, #8b6914 100%);
        }

        .landing-shell .photo-bg-3 {
          background: linear-gradient(135deg, #6b8fa8 0%, #3d6b8a 100%);
        }

        .landing-shell .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          opacity: 0.7;
        }

        .landing-shell .section.live-booking .section-copy {
          font-size: 14px;
          line-height: 1.65;
          color: var(--body);
          margin-top: 2px;
        }

        @media (min-width: 640px) {
          .landing-shell .hero-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="trust-bar">
        <div className="brand-wrap">
          <Image
            src="/logo-transparent-cropped.webp"
            alt="Bea Vita Tours"
            width={190}
            height={50}
            priority
            className="h-6 w-auto"
          />
        </div>
        <div className="trust-badges">
          <a
            className="badge-portal badge-gyg"
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            GetYourGuide
          </a>
          <a
            className="badge-portal badge-viator"
            href="https://www.viator.com/"
            target="_blank"
            rel="noreferrer"
          >
            Viator
          </a>
          <div className="stars-mini">
            <span className="s">★★★★★</span>
            <span>5.0</span>
          </div>
        </div>
      </div>

      <div className="gallery">
        <Image
          src="/tourprosecco.jpg"
          alt="Prosecco hills"
          fill
          priority
          sizes="100vw"
          className="gallery-main"
        />
        <div className="gallery-overlay" aria-hidden="true" />
        <div className="gallery-badge">Traveller favourite</div>
        <div className="gallery-thumbs">
          <div className="thumb-placeholder photo-bg-2">
            <Image
              src="/tourwines.jpg"
              alt="Wine tasting thumbnail"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="thumb-placeholder photo-bg-3">
            <Image
              src="/shared.jpg"
              alt="Scenic thumbnail"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="thumb-placeholder">+7</div>
        </div>
        <div className="gallery-count">Photo from the tour</div>
      </div>

      <div className="hero-info">
        <div className="hero-meta">
          <div className="meta-chip">
            <Clock3 className="icon size-3.5" /> 7 hours
          </div>
          <div className="meta-chip">
            <Users className="icon size-3.5" /> Max 8 guests
          </div>
          <div className="meta-chip">
            <MapPin className="icon size-3.5" /> English
          </div>
        </div>
        <h1 className="hero-title">
          From Venice: Prosecco Hills wine day with Spritz and Asolo
        </h1>
        <div className="rating-row">
          <div className="star-row">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="size-4 fill-current" />
            ))}
          </div>
          <span className="rating-num">4.9</span>
          <span className="rating-count">· 394 reviews</span>
          <span className="rating-award">Top 20% day trips from Venice</span>
        </div>
      </div>

      <div className="booking-box" id="summary">
        <div className="booking-urgency">Popular departure</div>
        <div className="price-row">
          <span className="price-old">From 149 €</span>
          <span className="price-new">127 €</span>
          <span className="price-per">/ person</span>
          <span className="price-discount">−15%</span>
        </div>
        <a
          className="btn-book"
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
        >
          Check availability <ChevronRight className="size-4" />
        </a>
        <div className="booking-reassurances">
          <div className="reassurance-item">
            <span className="check">✓</span>
            <span>
              <strong style={{ color: "rgba(255,255,255,0.92)" }}>
                Free cancellation
              </strong>{" "}
              — full refund up to 24 hours before
            </span>
          </div>
          <div className="reassurance-item">
            <span className="check">✓</span>
            <span>
              <strong style={{ color: "rgba(255,255,255,0.92)" }}>
                Book now, pay later
              </strong>{" "}
              — lock in your spot without paying today
            </span>
          </div>
          <div className="reassurance-item">
            <span className="check">✓</span>
            <span>Instant confirmation · Mobile ticket</span>
          </div>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">What the day includes</h2>
        <div className="highlights-grid">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="highlight-item">
                <span className="highlight-icon">
                  <Icon className="size-5" />
                </span>
                <span className="highlight-text">{item.text}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">What’s included</h2>
        <div className="included-grid">
          <div className="inc-label">Included ✓</div>
          {included.map((item) => (
            <div key={item} className="inc-item">
              <span className="ok">✓</span> {item}
            </div>
          ))}
          <div className="inc-divider" />
          <div className="inc-label">Not included ✗</div>
          {notIncluded.map((item) => (
            <div key={item} className="inc-item">
              <span className="no">✗</span> {item}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Tour itinerary</h2>
        <div className="itinerary">
          {itinerary.map((step) => (
            <div key={`${step.title}-${step.time}`} className="itin-step">
              <div className="itin-left">
                <div
                  className={`itin-dot ${step.time === "Start" ? "start" : step.time === "End" ? "end" : "stop"}`}
                >
                  {step.dot}
                </div>
                {step.time !== "End" ? <div className="itin-line" /> : null}
              </div>
              <div className="itin-right">
                <div className="itin-name">{step.title}</div>
                <div className="itin-desc">{step.text}</div>
                {step.time !== "Start" && step.time !== "End" ? (
                  <span className="itin-time">{step.time}</span>
                ) : step.time === "Start" ? (
                  <span className="itin-time">Timing confirmed at booking</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Full description</h2>
        <div className="description-text">
          <p>
            Start with pickup at Piazzale Roma, the big square in the centre of
            Venice. Travel in a comfortable van for less than an hour to the
            beautiful Prosecco Hills, a UNESCO World Heritage landscape.
          </p>
          <p>
            Explore Veneto’s best-known wine region with your guide. Visit a
            family-run winery where you’ll learn how Prosecco is made straight
            from the producers. Taste four different Valdobbiadene Prosecco DOCG
            wines with local cheese, cured meats, and classic snacks.
          </p>
          <p>
            Enjoy the classic Italian aperitivo — Aperol Spritz with snacks — at
            a panoramic stop among the vineyards. Then spend time in Asolo, the
            medieval hill town known as the “city of a hundred horizons,” with
            room to wander, shop, and take in the view.
          </p>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Practical information</h2>
        <div className="info-grid">
          {practicalInfo.map((item) => (
            <div key={item.label} className="info-card">
              <div className="info-card-label">{item.label}</div>
              <div className="info-card-val">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="info-full">
          <strong>Not suitable for</strong>
          Children under 14 years · Wheelchair users
        </div>
        <div className="info-full">
          <strong>Good to know</strong>
          The tour runs in light rain · Small group (max 8 guests)
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Verified reviews</h2>
        <div className="review-agg">
          <div className="review-score">
            <div className="big">4.9</div>
            <div
              className="star-row"
              style={{ justifyContent: "center", margin: "2px 0" }}
            >
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="size-3.5 fill-current" />
              ))}
            </div>
            <div className="out">394 reviews</div>
          </div>
          <div className="review-right">
            <div className="review-bar-row">
              <span className="review-bar-label">Guide</span>
              <div className="review-bar-track">
                <div className="review-bar-fill" style={{ width: "100%" }} />
              </div>
              <span className="review-bar-num">5.0</span>
            </div>
            <div className="review-bar-row">
              <span className="review-bar-label">Transport</span>
              <div className="review-bar-track">
                <div className="review-bar-fill" style={{ width: "100%" }} />
              </div>
              <span className="review-bar-num">5.0</span>
            </div>
            <div className="review-bar-row">
              <span className="review-bar-label">Value</span>
              <div className="review-bar-track">
                <div className="review-bar-fill" style={{ width: "98%" }} />
              </div>
              <span className="review-bar-num">5.0</span>
            </div>
            <div
              style={{
                marginTop: "8px",
                fontSize: "11px",
                background: "#faf4e6",
                padding: "5px 10px",
                borderRadius: "6px",
                color: "#9d174d",
                border: "0.5px solid rgba(236,72,153,0.18)",
              }}
            >
              Top 20% day trips from Venice
            </div>
          </div>
        </div>

        <div className="community-photos">
          {photoTiles.map((photo) => (
            <div
              key={photo.src}
              style={{ position: "relative", aspectRatio: "1" }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
          ))}
          <div className="photo-more">+5</div>
        </div>

        {reviews.map((review) => (
          <div key={review.name} className="review-card">
            <div className="review-card-header">
              <div className="reviewer-avatar">{review.name.charAt(0)}</div>
              <div>
                <div className="reviewer-name">{review.name}</div>
                <div className="reviewer-meta">{review.meta}</div>
              </div>
            </div>
            <div className="review-stars">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="size-3.5 fill-current" />
              ))}
            </div>
            <div className="review-text">{review.text}</div>
            {review.reply ? (
              <div className="review-provider-reply">
                <strong>Reply from Bea Vita Tours</strong>
                {review.reply}
              </div>
            ) : null}
          </div>
        ))}
      </section>

      <section className="section live-booking" id="booking">
        <RegiondoWidget />
      </section>

      <div className="bottom-spacer" />

      <div className="sticky-cta">
        <div className="sticky-price">
          <div className="sticky-price-old">From 149 €</div>
          <div className="sticky-price-new">127 €</div>
          <div className="sticky-price-per">per person</div>
        </div>
        <a
          className="btn-sticky"
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
        >
          Book now
        </a>
      </div>
    </main>
  );
}
