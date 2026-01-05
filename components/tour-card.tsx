"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TourCardProps {
  title: string;
  href: string;
  image: any;
}

export function TourCard({ title, href, image }: TourCardProps) {
  const router = useRouter();

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={`View ${title} details`}
      onClick={(event) => {
        if (event.currentTarget !== event.target) return;
        router.push(href);
      }}
      onKeyDown={(event) => {
        if (event.currentTarget !== event.target) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(href);
        }
      }}
      className="group relative mt-0 block aspect-4/3 cursor-pointer overflow-hidden p-0 transition-shadow duration-300 ease-out hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-0 flex items-end">
        <div className="flex w-full items-end justify-between gap-3 p-5">
          <h3 className="text-lg font-semibold leading-snug text-white">
            {title}
          </h3>

          <Button asChild size="icon-lg" className="shrink-0 rounded-xl">
            <Link href={href} onClick={(event) => event.stopPropagation()}>
              <ArrowRight />
              <span className="sr-only">View details</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
