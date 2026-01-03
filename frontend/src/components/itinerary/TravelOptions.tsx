import { Badge } from "@/components/ui/badge"
import { Plane, Navigation, Timer, DollarSign, CloudSnow, Info, CheckCircle, AlertTriangle, Train, Car, Bus } from "lucide-react"

interface TravelOptionsProps {
    data: any
}

export function TravelOptions({ data }: TravelOptionsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const getTravelModeIcon = (mode: string) => {
        switch (mode.toLowerCase()) {
            case 'flight': return <Plane className="w-4 h-4" />
            case 'road_taxi_private':
            case 'road_taxi':
            case 'road_taxi_or_bus':
            case 'road_taxi_short': return <Car className="w-4 h-4" />
            case 'train_shatabdi':
            case 'train_long_distance':
            case 'toy_train_or_taxi': return <Train className="w-4 h-4" />
            case 'road_bus_volvo_or_shared_taxi':
            case 'road_bus_overnight':
            case 'road_bus_overnight_option': return <Bus className="w-4 h-4" />
            default: return <Navigation className="w-4 h-4" />
        }
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                    <Plane className="w-4 h-4 text-accent" />
                    Travel Options: {data.trip.from_city} to {data.trip.to_city}
                </h3>
                <Badge variant="secondary">{data.trip.duration_days} Days Trip</Badge>
            </div>

            {/* Outbound Journey */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-green-600" />
                    Outbound Journey (Day {data.outbound.day_number})
                </h4>

                {data.outbound.options.map((option: any) => (
                    <div key={option.id} className={`bg-muted/50 rounded-lg p-4 border-2 ${option.id === data.outbound.recommended_option_id ? 'border-green-500 bg-green-50/10' : 'border-border'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <h5 className="font-medium text-foreground">{option.title}</h5>
                                {option.id === data.outbound.recommended_option_id && (
                                    <Badge variant="default" className="bg-green-600">Recommended</Badge>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-primary">
                                    {formatCurrency(option.total_time_door_to_door_hours.min * 1000)} - {formatCurrency(option.total_time_door_to_door_hours.max * 1000)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {option.total_time_door_to_door_hours.min}-{option.total_time_door_to_door_hours.max} hours
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{option.summary}</p>
                        <div className="space-y-2">
                            {option.segments.map((segment: any, segIndex: number) => (
                                <div key={segIndex} className="flex items-center gap-3 p-2 bg-background/50 rounded-md">
                                    {getTravelModeIcon(segment.mode)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">{segment.from}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="font-medium">{segment.to}</span>
                                        </div>
                                        {/* Additional segment info skipped for brevity/cleanliness but can be added back */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Tips */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent" />
                    Booking Tips & Important Notes
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="grid gap-2">
                        {data.booking_tips.map((tip: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
