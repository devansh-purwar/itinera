import GoogleMaps from "../GoogleMaps"
import { Navigation } from "lucide-react"

interface MapVisualizationProps {
    homeCity: string
    destinationCity: string
}

export function MapVisualization({ homeCity, destinationCity }: MapVisualizationProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                <Navigation className="w-4 h-4 text-accent" />
                Route Overview
            </h3>
            <div className="w-full h-[32rem]">
                <GoogleMaps
                    startPoint={homeCity}
                    endPoint={destinationCity}
                    travelMode="DRIVING"
                />
            </div>
        </div>
    )
}
