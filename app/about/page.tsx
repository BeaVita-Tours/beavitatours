export default function AboutPage() {
  return (
    <main className="min-h-screen flex items-center bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex-1 text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
              BEA VITA TOURS
            </h1>
            <h2 className="text-lg md:text-xl mt-2">
              Officially Licensed Tour Operator
            </h2>

            <div className="mt-6 text-sm md:text-base leading-relaxed whitespace-pre-line">
              Prot.Com. n. 6297 del 08/04/2025
              <br />
              Comune di Caerano di San Marco (TV)
              <br />
              <br />
              PEC beavitasrl@pec.it
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-xl md:text-2xl font-semibold">
                Quality - Price - Service (& Fun!)
              </h3>
              <p className="text-sm md:text-base leading-relaxed">
                We take great care to ensure that our tours are the best value
                for money in the business, and we know that outstanding value
                means ensuring that all of the ingredients are right. We take
                care of everything throughout the tour. All you have to do is
                show up and enjoy.
              </p>
            </div>
          </div>

          <div className="w-60 shrink-0">
            <img
              src="/logo.webp"
              alt="Bea Vita Tours logo"
              className="w-full h-auto mx-auto md:mx-0 rounded-xl"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
