import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Heart, Star } from "lucide-react"
import { useState } from "react"
// Note: We might want to pass data in or fetch it, but for now we'll accept props or import mock if needed.
// To keep it clean, let's assume parent passes the list or we use the mock data inside temporarily, 
// but the Goal is refactoring structure. Let's make it accept props for specific categories.

// We need to import the data for the "getAccommodations" logic or move that logic to a hook. 
// For now, I'll copy the helper logic here or expect pre-processed data. 
// To make it truly clean, the parent should pass the data. 
// But `accommodations.json` is static mock data. I will import it here directly.

import accommodationsData from "@/data/accommodations.json"

export function Accommodations({ destinationCity }: { destinationCity: string }) {
    const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set())

    const toggleFavorite = (itemId: string) => {
        const newFavorites = new Set(favoriteItems)
        if (newFavorites.has(itemId)) {
            newFavorites.delete(itemId)
        } else {
            newFavorites.add(itemId)
        }
        setFavoriteItems(newFavorites)
    }

    const getAccommodations = (category: 'hight' | 'medium' | 'low', day: number) => {
        // Basic type safety for the JSON structure
        const categoryData = accommodationsData[category] as any
        const dayData = categoryData?.[day.toString()]
        return dayData?.stays || []
    }

    // Generate random rating helper (preserved from original)
    const generateRating = (hotelName: string) => {
        let hash = 0
        for (let i = 0; i < hotelName.length; i++) {
            hash = ((hash << 5) - hash) + hotelName.charCodeAt(i)
            hash = hash & hash
        }
        const seed = Math.abs(hash) % 1000
        return Math.round((3.8 + (seed / 1000) * 0.7) * 10) / 10
    }

    const renderStarRating = (rating: number) => {
        // Simplified for brevity in this refactor step
        return <div className="flex items-center gap-1"><span className="text-yellow-500">★</span><span>{rating}</span></div>
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-accent" />
                    Recommended Accommodations in {destinationCity}
                </h3>
            </div>

            {/* Luxury Category - Example for Refactor */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        ★ Luxury
                    </Badge>
                    <span className="text-sm text-muted-foreground">Premium comfort and exceptional service</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getAccommodations('hight', 1).map((hotel: any, index: number) => {
                        const cleanName = hotel.name.split('"')[0].trim()
                        const rating = generateRating(cleanName)
                        return (
                            <div key={index} className="bg-muted/50 rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative">
                                    <img
                                        src={hotel.imageUrl || "/placeholder.svg"}
                                        alt={cleanName}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/placeholder.svg"
                                        }}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="bg-white/90 text-foreground">Luxury</Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-semibold text-foreground mb-2">{cleanName}</h4>
                                    <div className="flex items-center justify-between mb-3">
                                        {renderStarRating(rating)}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleFavorite(`luxury-${index}`)}
                                            className="text-muted-foreground hover:text-red-500"
                                        >
                                            <Heart className={`w-4 h-4 ${favoriteItems.has(`luxury-${index}`) ? 'fill-current text-red-500' : ''}`} />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        <span>Central Location</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {/* Mid/Budget can be added similarly */}
        </div>
    )
}
