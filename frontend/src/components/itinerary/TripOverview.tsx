import { MapPin, Calendar, Mountain, Info, CheckCircle } from "lucide-react"
import { MapVisualization } from "./MapVisualization"

interface TripOverviewProps {
    data: any
}

export function TripOverview({ data }: TripOverviewProps) {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Trip Overview: {data.home_city} to {data.destination_city}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border text-center">
                        <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold text-primary">{data.num_days}</div>
                        <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border text-center">
                        <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold text-primary">{data.days.length}</div>
                        <div className="text-sm text-muted-foreground">Planned Days</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border text-center">
                        <Mountain className="w-8 h-8 text-primary mx-auto mb-2" />
                        <div className="text-lg font-bold text-primary">Leisure</div>
                        <div className="text-sm text-muted-foreground">Trip Type</div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <MapVisualization
                homeCity={data.home_city}
                destinationCity={data.destination_city}
            />

            {/* Tips */}
            <div className="space-y-3">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent" />
                    Essential Travel Tips
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="grid gap-2">
                        {data.overall_tips.slice(0, 5).map((tip: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
