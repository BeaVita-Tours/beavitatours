import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/public/logo.png";
import Image from "next/image";

export default function ComingSoon() {
  return (
    <div className="relative h-screen overflow-hidden bg-black">
      <video
        className="w-full h-full object-cover absolute top-0 left-0 opacity-35"
        src="/bg.webm"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-3xl font-bold mb-8">COMING SOON</h1>
        <div className="flex flex-col items-center justify-center mb-8">
          <Image src={logo} alt="Logo" className="z-50 size-48" />
          <div className="text-white text-xl font-normal">
            Your Venice tour partner
          </div>
        </div>
        <Link
          href="https://beautifuldolomites.com/booking.html"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "text-lg rounded-xl px-8 py-6"
          )}
        >
          Book Now
        </Link>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center pb-8">
        <div className="text-center text-sm text-white opacity-50">
          <p className="text-sm leading-relaxed">VAT No 04897010262</p>
          <p className="text-sm leading-relaxed">
            &copy; {new Date().getFullYear()} OutsideVenice. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
