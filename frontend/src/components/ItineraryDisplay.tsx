"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Download, ShoppingBag } from "lucide-react"

// New Sub-Components
import { TripOverview } from "./itinerary/TripOverview"
import { DailyItinerary } from "./itinerary/DailyItinerary"
import { TravelOptions } from "./itinerary/TravelOptions"
import { Accommodations } from "./itinerary/Accommodations"

// Data (Fallback)
import itineraryData from "@/data/iternary.json"
import travelOptionsData from "@/data/travel-options.json"

// Configuration for progressive loading
const LOADING_CONFIG = {
  sectionDelay: 800,
  sectionRandomDelay: 400,
  initialDelay: 600,
}

interface TravelOutputPanelProps {
  showContent?: boolean
  isThinkingComplete?: boolean
  itineraryData?: any
}

export default function ItineraryDisplay({ showContent = false, itineraryData: propItineraryData }: TravelOutputPanelProps) {
  const displayData = propItineraryData || itineraryData
  const [activeTab, setActiveTab] = useState("overview")

  // Loading State
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set())
  const [isLoadingSection, setIsLoadingSection] = useState<string | null>(null)
  const loadingTimeouts = useRef<NodeJS.Timeout[]>([])

  // Sections for Progressive Loading
  const sections = [
    { key: "trip-summary", name: "Trip Summary" },
    { key: "route-map", name: "Route Overview" },
    { key: "travel-tips", name: "Travel Tips" },
    { key: "itinerary-details", name: "Itinerary Details" },
    { key: "travel-options", name: "Travel Options" },
    { key: "accommodation-info", name: "Accommodation Info" },
  ]

  useEffect(() => {
    if (showContent) {
      startProgressiveLoading()
    } else {
      setLoadedSections(new Set())
      setIsLoadingSection(null)
      loadingTimeouts.current.forEach(clearTimeout)
      loadingTimeouts.current = []
    }
    return () => {
      loadingTimeouts.current.forEach(clearTimeout)
    }
  }, [showContent])

  const startProgressiveLoading = () => {
    loadingTimeouts.current.forEach(clearTimeout)
    loadingTimeouts.current = []
    setLoadedSections(new Set())

    const loadSection = (sectionIndex: number) => {
      if (sectionIndex >= sections.length) return
      const section = sections[sectionIndex]
      setIsLoadingSection(section.key)

      const delay = sectionIndex === 0 ? LOADING_CONFIG.initialDelay : LOADING_CONFIG.sectionDelay

      const timeout = setTimeout(() => {
        setLoadedSections(prev => new Set([...prev, section.key]))
        setIsLoadingSection(null)
        const nextTimeout = setTimeout(() => loadSection(sectionIndex + 1), 200)
        loadingTimeouts.current.push(nextTimeout)
      }, delay)

      loadingTimeouts.current.push(timeout)
    }
    loadSection(0)
  }

  const SectionLoader = ({ sectionKey, children }: { sectionKey: string; children: React.ReactNode }) => {
    if (!showContent) return null
    // If we want to check for individual section loading, we can. 
    // Or just show everything if the *panel* is open, but simpler.
    // Preserving logic:
    const isLoaded = loadedSections.has(sectionKey)
    const isLoading = isLoadingSection === sectionKey
    if (!isLoaded && !isLoading) return null

    if (isLoading) {
      return <div className="p-4 animate-pulse"><div className="h-4 bg-muted w-1/2 mb-2"></div><div className="h-32 bg-muted rounded"></div></div>
    }

    return (
      <div className={`transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-4`}>
        {children}
      </div>
    )
  }

  const downloadTravelPamphlet = () => {
    const link = document.createElement('a')
    link.href = '/static/travel-pamplet.pdf'
    link.download = 'pune-to-shimla-travel-guide.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="gradient-card border-border overflow-hidden h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Travel Insights
            {isLoadingSection && (
              <span className="text-xs font-normal text-muted-foreground ml-2 animate-pulse">
                Loading {sections.find(s => s.key === isLoadingSection)?.name}...
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={downloadTravelPamphlet} size="sm" variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> PDF
            </Button>
            <Button size="sm" className="gap-2">
              <ShoppingBag className="w-4 h-4" /> Book
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 flex-shrink-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
          <TabsTrigger value="hotels">Stay</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="overview" className="mt-0 p-4">
            <SectionLoader sectionKey="trip-summary">
              <TripOverview data={displayData} />
            </SectionLoader>
          </TabsContent>

          <TabsContent value="itinerary" className="mt-0 p-4">
            <SectionLoader sectionKey="itinerary-details">
              <DailyItinerary days={displayData.days} destinationCity={displayData.destination_city} numDays={displayData.num_days} />
            </SectionLoader>
          </TabsContent>

          <TabsContent value="travel" className="mt-0 p-4">
            <SectionLoader sectionKey="travel-options">
              {/* Note: In a real app, we'd fetch travel data dynamically too. For now using static fallback import */}
              <TravelOptions data={travelOptionsData} />
            </SectionLoader>
          </TabsContent>

          <TabsContent value="hotels" className="mt-0 p-4">
            <SectionLoader sectionKey="accommodation-info">
              <Accommodations destinationCity={displayData.destination_city} />
            </SectionLoader>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}
