"use client";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex items-center bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row items-stretch gap-8">
          {/* Left panel: stacked title, subtitle, prot.com, PEC and main logo + badges */}
          <div className="md:w-1/2 bg-surface/50 p-6 rounded-xl flex flex-col gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
                BEA VITA TOURS
              </h1>
              <h2 className="text-lg md:text-xl mt-2 text-muted-foreground">
                Officially Licensed Tour Operator
              </h2>
            </div>

            <div className="text-sm md:text-base leading-relaxed whitespace-pre-line">
              {`Prot.Com. n. 6297 del 08/04/2025
Comune di Caerano di San Marco (TV)

PEC beavitasrl@pec.it`}
            </div>

            <div className="w-full max-w-sm">
              <img
                src="/logo.webp"
                alt="Bea Vita Tours logo"
                className="w-full h-auto rounded-lg shadow"
              />
            </div>

            <div className="mt-auto flex items-center gap-4">
              <img
                src="/about/poweredbygoogle.png"
                alt="Powered by Google"
                className="h-10 object-contain"
              />
              <img
                src="/about/lowcarbontravel.png"
                alt="Low Carbon Travel"
                className="h-10 object-contain"
              />
              <img
                src="/about/landofvenice.jpg"
                alt="Land of Venice"
                className="h-10 object-contain rounded-md"
              />
            </div>
          </div>

          {/* Right panel: Quality box with slightly larger text */}
          <div className="md:w-1/2 bg-surface/50 p-8 rounded-xl flex items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold">
                Quality - Price - Service (&amp; Fun!)
              </h3>
              <p className="mt-4 text-base md:text-lg leading-relaxed">
                We take great care to ensure that our tours are the best value
                for money in the business, and we know that outstanding value
                means ensuring that all of the ingredients are right. We take
                care of everything throughout the tour. All you have to do is
                show up and enjoy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
