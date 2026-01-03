import { Badge } from "@/components/ui/badge"
import { Calendar, Mountain, MapPin, Route, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DailyItineraryProps {
    days: any[]
    destinationCity: string
    numDays: number
}

export function DailyItinerary({ days, destinationCity, numDays }: DailyItineraryProps) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    {numDays}-Day {destinationCity} Itinerary
                </h3>
                <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            </div>

            {days.map((day: any) => (
                <div key={day.day} className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                                {day.day}
                            </div>
                            <h4 className="font-medium text-foreground">{day.summary}</h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Day {day.day}
                        </Badge>
                    </div>

                    {day.entities.map((entity: any, entityIndex: number) => (
                        <div key={entityIndex} className="mb-6 last:mb-0">
                            <div className="flex items-start gap-3 mb-3">
                                <Mountain className="w-5 h-5 text-accent mt-1" />
                                <div className="flex-1">
                                    <h5 className="font-medium text-foreground mb-1">{entity.name}</h5>
                                    <p className="text-sm text-muted-foreground mb-3">{entity.speciality}</p>
                                </div>
                            </div>

                            <div className="grid gap-3 ml-8">
                                {entity.places_to_visit.map((place: any, placeIndex: number) => (
                                    <div key={placeIndex} className="bg-background/50 rounded-md p-3 border border-border/50">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h6 className="font-medium text-foreground text-sm mb-1">{place.name}</h6>
                                                <p className="text-xs text-muted-foreground">{place.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {entity.image_urls && entity.image_urls.length > 0 && (
                                <div className="flex gap-2 mt-3 ml-8">
                                    {entity.image_urls.slice(0, 2).map((imageUrl: string, imgIndex: number) => (
                                        <div key={imgIndex} className="flex-1">
                                            <img
                                                src={imageUrl || "/placeholder.svg"}
                                                alt={`${entity.name} view ${imgIndex + 1}`}
                                                className="w-full h-80 object-cover rounded-md"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "/placeholder.svg";
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {day.route_info && (
                        <div className="mt-4 pt-3 border-t border-border">
                            <div className="flex items-start gap-2">
                                <Route className="w-4 h-4 text-accent mt-1" />
                                <div>
                                    <h6 className="text-sm font-medium text-foreground mb-1">Route Information</h6>
                                    <p className="text-xs text-muted-foreground">{day.route_info}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
