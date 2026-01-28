export default function AboutPage() {
  return (
    <main className="min-h-screen flex items-center bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex-1 text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
              BEA VITA TOURS
            </h1>
            <h2 className="text-lg md:text-xl mt-2">Agenzia di Viaggi</h2>

            <div className="mt-6 text-sm md:text-base leading-relaxed whitespace-pre-line">
              Protocollo Comunale n. 6297 del 08/04/2025
              <br />
              Comune di Caerano di San Marco (TV)
              <br />
              <br />
              PEC cazzolato82@pec.it
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
