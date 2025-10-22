import { Card, CardContent } from "@/components/ui/card"

interface TourFeatureProps {
  title: string
  description: string
  image: string
}

export function TourFeature({ title, description, image }: TourFeatureProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
      </div>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
