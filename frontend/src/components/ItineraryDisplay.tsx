"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  Phone,
  Utensils,
  Camera,
  Navigation,
  Heart,
  Share2,
  ExternalLink,
  Plane,
  Car,
  Train,
  Bus,
  Mountain,
  Building,
  TreePine,
  Camera as CameraIcon,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  Info,
  Route,
  Timer,
  Users,
  Luggage,
  CloudSnow,
  Sun,
  Cloud,
  ShoppingBag,
} from "lucide-react"
import GoogleMaps from "./GoogleMaps"
import itineraryData from "@/app/data/iternary.json"
import travelOptionsData from "@/app/data/travel-options.json"
import accommodationsData from "@/app/data/accommodations.json"

// Configuration for progressive loading
const LOADING_CONFIG = {
  sectionDelay: 800, // Delay between sections
  sectionRandomDelay: 400, // Random additional delay
  fadeInDuration: 600, // Fade in animation duration
  initialDelay: 600, // Initial delay before first section
}

interface TravelOutputPanelProps {
  showContent?: boolean
  isThinkingComplete?: boolean
}

export default function ItineraryDisplay({ showContent = false, isThinkingComplete = false }: TravelOutputPanelProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set())
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set())
  const [isLoadingSection, setIsLoadingSection] = useState<string | null>(null)
  const loadingTimeouts = useRef<NodeJS.Timeout[]>([])

  // Clear all timeouts
  const clearLoadingTimers = () => {
    loadingTimeouts.current.forEach(clearTimeout)
    loadingTimeouts.current = []
  }

  // Sections to load progressively
  const sections = [
    { key: "trip-summary", name: "Trip Summary" },
    { key: "route-map", name: "Route Overview" },
    { key: "travel-tips", name: "Travel Tips" },
    { key: "itinerary-details", name: "Itinerary Details" },
    { key: "travel-options", name: "Travel Options" },
    { key: "accommodation-info", name: "Accommodation Info" },
    { key: "dining-info", name: "Dining Information" },
    { key: "contacts-info", name: "Local Contacts" }
  ]

  // Start progressive loading when showContent becomes true
  useEffect(() => {
    if (showContent) {
      startProgressiveLoading()
    } else {
      // Reset when content is hidden
      setLoadedSections(new Set())
      setIsLoadingSection(null)
      clearLoadingTimers()
    }

    return () => clearLoadingTimers()
  }, [showContent])

  const startProgressiveLoading = () => {
    clearLoadingTimers()
    setLoadedSections(new Set())

    const loadSection = (sectionIndex: number) => {
      if (sectionIndex >= sections.length) return

      const section = sections[sectionIndex]
      setIsLoadingSection(section.key)

      const delay = sectionIndex === 0 ?
        LOADING_CONFIG.initialDelay :
        LOADING_CONFIG.sectionDelay + Math.random() * LOADING_CONFIG.sectionRandomDelay

      const timeout = setTimeout(() => {
        setLoadedSections(prev => new Set([...prev, section.key]))
        setIsLoadingSection(null)

        // Visual feedback for section completion
        console.log(`✅ Section loaded: ${section.name}`)

        // Load next section
        const nextTimeout = setTimeout(() => loadSection(sectionIndex + 1), 200)
        loadingTimeouts.current.push(nextTimeout)
      }, delay)

      loadingTimeouts.current.push(timeout)
    }

    loadSection(0)
  }

  const SectionLoader = ({ sectionKey, children }: { sectionKey: string; children: React.ReactNode }) => {
    const isLoaded = loadedSections.has(sectionKey)
    const isLoading = isLoadingSection === sectionKey

    if (!showContent) return null

    if (!isLoaded && !isLoading) return null

    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-5 w-5 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="h-3 w-16 bg-muted rounded"></div>
          </div>
        </div>
      )
    }

    return (
      <div className={`transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-4 ${isLoaded ? 'opacity-100 transform translate-y-0' : ''}`}>
        {children}
      </div>
    )
  }

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favoriteItems)
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId)
    } else {
      newFavorites.add(itemId)
    }
    setFavoriteItems(newFavorites)
  }

  const getTravelModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flight':
        return <Plane className="w-4 h-4" />
      case 'road_taxi_private':
      case 'road_taxi':
      case 'road_taxi_or_bus':
      case 'road_taxi_short':
        return <Car className="w-4 h-4" />
      case 'train_shatabdi':
      case 'train_long_distance':
      case 'toy_train_or_taxi':
        return <Train className="w-4 h-4" />
      case 'road_bus_volvo_or_shared_taxi':
      case 'road_bus_overnight':
      case 'road_bus_overnight_option':
        return <Bus className="w-4 h-4" />
      default:
        return <Navigation className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Generate random rating between 3.8 and 4.5
  const generateRating = (hotelName: string) => {
    // Use hotel name as seed for consistent ratings
    let hash = 0
    for (let i = 0; i < hotelName.length; i++) {
      const char = hotelName.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
      const seed = Math.abs(hash) % 1000
      const rating = 3.8 + (seed / 1000) * 0.7 // Range: 3.8 - 4.5
      return Math.round(rating * 10) / 10
    }
    return 4.0; // Default fallback
  }

  // Clean hotel name (remove booking site info)
  const cleanHotelName = (name: string) => {
    return name.split('"')[0].trim()
  }

  // Get accommodations for specific category and day
  const getAccommodations = (category: 'hight' | 'medium' | 'low', day: number) => {
    const categoryData = accommodationsData[category]
    const dayData = categoryData?.[day.toString() as keyof typeof categoryData]
    return dayData?.stays || []
  }

  // Render star rating
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    )
  }

  // Download travel pamphlet
  const downloadTravelPamphlet = () => {
    // Create a link to download the PDF from the public/static folder
    const link = document.createElement('a')
    link.href = '/static/travel-pamplet.pdf'
    link.download = 'pune-to-shimla-travel-guide.pdf'
    link.target = '_blank'

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="gradient-card border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Travel Insights & Planning
            {isLoadingSection && (
              <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                Loading {sections.find(s => s.key === isLoadingSection)?.name}...
              </div>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={downloadTravelPamphlet}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Download className="w-4 h-4" />
              Download travel pamphlet
            </Button>
            <Button
              onClick={() => window.open('/reservations', '_blank')}
              size="sm"
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Book Trip
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50 flex-shrink-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="travel">Travel Options</TabsTrigger>
          <TabsTrigger value="hotels">Accommodations</TabsTrigger>
          <TabsTrigger value="dining">Dining</TabsTrigger>
          <TabsTrigger value="contacts">Local Info</TabsTrigger>
        </TabsList>

        <div className="overflow-y-auto flex-1 min-h-0">
          <TabsContent value="overview" className="p-4 space-y-6">
            {/* Trip Summary */}
            <SectionLoader sectionKey="trip-summary">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  Trip Overview: {itineraryData.home_city} to {itineraryData.destination_city}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border text-center">
                    <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{itineraryData.num_days}</div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{itineraryData.days.length}</div>
                    <div className="text-sm text-muted-foreground">Planned Days</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border text-center">
                    <Mountain className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-primary">Hill Station</div>
                    <div className="text-sm text-muted-foreground">Destination Type</div>
                  </div>
                </div>
              </div>
            </SectionLoader>

            {/* Interactive Map */}
            <SectionLoader sectionKey="route-map">
              <div className="space-y-3">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-accent" />
                  Route Overview
                </h3>
                <div className="w-full h-[32rem]">
                  <GoogleMaps
                    startPoint={itineraryData.home_city}
                    endPoint={itineraryData.destination_city}
                    travelMode="DRIVING"
                  />
                </div>
              </div>
            </SectionLoader>

            {/* Travel Tips */}
            <SectionLoader sectionKey="travel-tips">
              <div className="space-y-3">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent" />
                  Essential Travel Tips
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="grid gap-2">
                    {itineraryData.overall_tips.slice(0, 5).map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionLoader>
          </TabsContent>

          <TabsContent value="itinerary" className="p-4 space-y-4">
            <SectionLoader sectionKey="itinerary-details">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  {itineraryData.num_days}-Day {itineraryData.destination_city} Itinerary
                </h3>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {itineraryData.days.map((day) => (
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

                  {day.entities.map((entity, entityIndex) => (
                    <div key={entityIndex} className="mb-6 last:mb-0">
                      <div className="flex items-start gap-3 mb-3">
                        <Mountain className="w-5 h-5 text-accent mt-1" />
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground mb-1">{entity.name}</h5>
                          <p className="text-sm text-muted-foreground mb-3">{entity.speciality}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 ml-8">
                        {entity.places_to_visit.map((place, placeIndex) => (
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
                          {entity.image_urls.slice(0, 2).map((imageUrl, imgIndex) => (

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
            </SectionLoader>
          </TabsContent>

          <TabsContent value="travel" className="p-4 space-y-6">
            <SectionLoader sectionKey="travel-options">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                  <Plane className="w-4 h-4 text-accent" />
                  Travel Options: {travelOptionsData.trip.from_city} to {travelOptionsData.trip.to_city}
                </h3>
                <Badge variant="secondary">{travelOptionsData.trip.duration_days} Days Trip</Badge>
              </div>

              {/* Outbound Journey */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-600" />
                  Outbound Journey (Day {travelOptionsData.outbound.day_number})
                </h4>

                {travelOptionsData.outbound.options.map((option) => (
                  <div key={option.id} className={`bg-muted/50 rounded-lg p-4 border-2 ${option.id === travelOptionsData.outbound.recommended_option_id ? 'border-green-500 bg-green-50/10' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-foreground">{option.title}</h5>
                        {option.id === travelOptionsData.outbound.recommended_option_id && (
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
                      {option.segments.map((segment, segIndex) => (
                        <div key={segIndex} className="flex items-center gap-3 p-2 bg-background/50 rounded-md">
                          {getTravelModeIcon(segment.mode)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{segment.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">{segment.to}</span>
                            </div>
                            {segment.typical_duration_range_hours && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Timer className="w-3 h-3" />
                                {Array.isArray(segment.typical_duration_range_hours)
                                  ? `${segment.typical_duration_range_hours[0]}-${segment.typical_duration_range_hours[1]} hours`
                                  : `${segment.typical_duration_range_hours} hours`
                                }
                              </div>
                            )}
                            {segment.estimated_cost_inr && (
                              <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <DollarSign className="w-3 h-3" />
                                {typeof segment.estimated_cost_inr === 'object' && 'min' in segment.estimated_cost_inr && segment.estimated_cost_inr.min && segment.estimated_cost_inr.max
                                  ? `${formatCurrency(segment.estimated_cost_inr.min)} - ${formatCurrency(segment.estimated_cost_inr.max)}`
                                  : 'Cost varies'
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {option.ideal_for && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex flex-wrap gap-1">
                          {option.ideal_for.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              ✓ {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {option.risks && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {option.risks.map((risk, i) => (
                            <Badge key={i} variant="destructive" className="text-xs opacity-70">
                              ⚠ {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Return Journey */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600 scale-x-[-1]" />
                  Return Journey (Day {travelOptionsData.return.day_number})
                </h4>

                {travelOptionsData.return.options.map((option) => (
                  <div key={option.id} className={`bg-muted/50 rounded-lg p-4 border-2 ${option.id === travelOptionsData.return.recommended_option_id ? 'border-blue-500 bg-blue-50/10' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-foreground">{option.title}</h5>
                        {option.id === travelOptionsData.return.recommended_option_id && (
                          <Badge variant="default" className="bg-blue-600">Recommended</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{option.summary}</p>

                    <div className="space-y-2">
                      {option.segments.map((segment, segIndex) => (
                        <div key={segIndex} className="flex items-center gap-3 p-2 bg-background/50 rounded-md">
                          {getTravelModeIcon(segment.mode)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{segment.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">{segment.to}</span>
                            </div>
                            {segment.typical_duration_range_hours && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Timer className="w-3 h-3" />
                                {Array.isArray(segment.typical_duration_range_hours)
                                  ? `${segment.typical_duration_range_hours[0]}-${segment.typical_duration_range_hours[1]} hours`
                                  : `${segment.typical_duration_range_hours} hours`
                                }
                              </div>
                            )}
                            {segment.estimated_cost_inr && (
                              <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <DollarSign className="w-3 h-3" />
                                {typeof segment.estimated_cost_inr === 'object' && 'min' in segment.estimated_cost_inr && segment.estimated_cost_inr.min && segment.estimated_cost_inr.max
                                  ? `${formatCurrency(segment.estimated_cost_inr.min)} - ${formatCurrency(segment.estimated_cost_inr.max)}`
                                  : 'Cost varies'
                                }
                              </div>
                            )}
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
                    {travelOptionsData.booking_tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seasonal Notes */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CloudSnow className="w-4 h-4 text-accent" />
                  Seasonal & Weather Considerations
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="grid gap-2">
                    {travelOptionsData.baggage_and_seasonal_notes.map((note, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionLoader>
          </TabsContent>

          <TabsContent value="hotels" className="p-4 space-y-4">
            <SectionLoader sectionKey="accommodation-info">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                  <Building className="w-4 h-4 text-accent" />
                  Recommended Accommodations in {itineraryData.destination_city}
                </h3>
              </div>

              {/* Luxury Category */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    ★ Luxury
                  </Badge>
                  <span className="text-sm text-muted-foreground">Premium comfort and exceptional service</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAccommodations('hight', 1).map((hotel, index) => {
                    const cleanName = cleanHotelName(hotel.name)
                    const rating = generateRating(cleanName)
                    return (
                      <div key={index} className="bg-muted/50 rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={hotel.imageUrl || "/placeholder.svg"}
                            alt={cleanName}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-foreground">
                              Luxury
                            </Badge>
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
                            <span>Near Mall Road, Shimla</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">Free WiFi</Badge>
                            <Badge variant="outline" className="text-xs">Mountain View</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mid-Range Category */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    ★ Mid-Range
                  </Badge>
                  <span className="text-sm text-muted-foreground">Great value with good amenities</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAccommodations('medium', 1).map((hotel, index) => {
                    const cleanName = cleanHotelName(hotel.name)
                    const rating = generateRating(cleanName)
                    return (
                      <div key={index} className="bg-muted/50 rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={hotel.imageUrl || "/placeholder.svg"}
                            alt={cleanName}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-foreground">
                              Mid-Range
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-foreground mb-2">{cleanName}</h4>
                          <div className="flex items-center justify-between mb-3">
                            {renderStarRating(rating)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(`medium-${index}`)}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Heart className={`w-4 h-4 ${favoriteItems.has(`medium-${index}`) ? 'fill-current text-red-500' : ''}`} />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>Central Location, Shimla</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">Free WiFi</Badge>
                            <Badge variant="outline" className="text-xs">Breakfast</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Budget Category */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                    ★ Budget-Friendly
                  </Badge>
                  <span className="text-sm text-muted-foreground">Affordable stays with essential amenities</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAccommodations('low', 1).map((hotel, index) => {
                    const cleanName = cleanHotelName(hotel.name)
                    const rating = generateRating(cleanName)
                    return (
                      <div key={index} className="bg-muted/50 rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={hotel.imageUrl || "/placeholder.svg"}
                            alt={cleanName}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-foreground">
                              Budget
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-foreground mb-2">{cleanName}</h4>
                          <div className="flex items-center justify-between mb-3">
                            {renderStarRating(rating)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(`budget-${index}`)}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Heart className={`w-4 h-4 ${favoriteItems.has(`budget-${index}`) ? 'fill-current text-red-500' : ''}`} />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>Accessible Location, Shimla</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">WiFi</Badge>
                            <Badge variant="outline" className="text-xs">Shared Facilities</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Booking Tips */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Accommodation Booking Tips
                </h4>
                <div className="grid gap-2">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Book well in advance during peak season (April-June, October-November)</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Look for properties with heating facilities as nights can be cold</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Stay near Mall Road for easy access to main attractions and dining</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Check cancellation policies, especially for mountain destinations</span>
                  </div>
                </div>
              </div>
            </SectionLoader>
          </TabsContent>

          <TabsContent value="dining" className="p-4 space-y-4">
            <SectionLoader sectionKey="dining-info">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-accent" />
                  Local Cuisine & Dining in {itineraryData.destination_city}
                </h3>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">Himachali Cuisine Highlights</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover the authentic flavors of Himachal Pradesh during your {itineraryData.num_days}-day stay:
                </p>
                <div className="text-left space-y-3">
                  <div className="bg-background/50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-foreground">Must-Try Dishes</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Siddu, Chha Gosht, Babru, Dham, Aktori, Tudkiya Bhath
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">Best Areas for Dining</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Mall Road, The Ridge, Lakkar Bazaar, Lower Bazaar
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Sun className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-foreground">Local Beverages</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rhododendron juice, Apple cider, Local tea varieties, Kahwa
                    </div>
                  </div>
                </div>
              </div>
            </SectionLoader>
          </TabsContent>

          <TabsContent value="contacts" className="p-4 space-y-4">
            {!isThinkingComplete ? (
              <div></div>
            ) : (
              <SectionLoader sectionKey="contacts-info">
                <h3 className="text-md font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  Important Local Contacts & Information
                </h3>

                <div className="grid gap-4">
                  {/* Emergency Contacts */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Emergency Contacts
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-background/50 rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">Emergency</Badge>
                          <span className="font-medium text-foreground">Police</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-primary">100</span>
                          <Button variant="outline" size="sm">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-background/50 rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">Emergency</Badge>
                          <span className="font-medium text-foreground">Fire/Ambulance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-primary">101/108</span>
                          <Button variant="outline" size="sm">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tourist Information */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Tourist Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-background/50 rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Tourist Info</Badge>
                          <span className="font-medium text-foreground">Shimla Tourist Office</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-primary">0177-2652561</span>
                          <Button variant="outline" size="sm">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-background/50 rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Transport</Badge>
                          <span className="font-medium text-foreground">HRTC Bus Stand</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-primary">0177-2652574</span>
                          <Button variant="outline" size="sm">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Local Transit Tips */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4 text-green-500" />
                      Local Transportation Tips
                    </h4>
                    <div className="space-y-2">
                      {travelOptionsData.local_transit_in_shimla.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionLoader>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}
