import { TravelAgencyForm } from "@/components/travel-agency-form";

export default function TravelAgencyPage() {
  return (
    <main className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Are you a Travel Agency?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Send us your details and we’ll get back to you.
            </p>
          </div>

          <div className="mt-10">
            <TravelAgencyForm />
          </div>
        </div>
      </div>
    </main>
  );
}
