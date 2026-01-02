"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  ArrowLeft,
  Wifi,
  Coffee,
  Shield,
  CreditCard
} from "lucide-react"
import accommodationsData from "@/app/data/accommodations.json"
import travelOptionsData from "@/app/data/travel-options.json"

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState("accommodations")
  const [selectedAccommodations, setSelectedAccommodations] = useState<Set<string>>(new Set())
  const [selectedTravelOptions, setSelectedTravelOptions] = useState<Set<string>>(new Set())

  // Generate random rating between 3.8 and 4.5
  const generateRating = (name: string) => {
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    const rating = 3.8 + (Math.abs(hash) % 70) / 100
    return Math.round(rating * 10) / 10
  }

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />)
    }

    return stars
  }

  // Clean hotel name (remove booking site info)
  const cleanHotelName = (name: string) => {
    return name.replace(/\s*-\s*(Booking\.com|Hotels\.com|Expedia).*$/, '')
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get travel mode icon
  const getTravelModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'train':
        return <Train className="w-4 h-4" />
      case 'bus':
        return <Bus className="w-4 h-4" />
      case 'car':
        return <Car className="w-4 h-4" />
      case 'flight':
      case 'airplane':
        return <Plane className="w-4 h-4" />
      default:
        return <Car className="w-4 h-4" />
    }
  }

  // Toggle accommodation selection
  const toggleAccommodationSelection = (id: string) => {
    const newSelection = new Set(selectedAccommodations)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedAccommodations(newSelection)
  }

  // Toggle travel option selection
  const toggleTravelOptionSelection = (id: string) => {
    const newSelection = new Set(selectedTravelOptions)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedTravelOptions(newSelection)
  }

  // Calculate total cost
  const calculateTotalCost = () => {
    let total = 0
    
    // Calculate accommodation costs
    Object.entries(accommodationsData).forEach(([category, days]) => {
      Object.entries(days).forEach(([day, dayData]: [string, any]) => {
        dayData.stays.forEach((hotel: any, index: number) => {
          const hotelId = `${category}-${day}-${index}`
          if (selectedAccommodations.has(hotelId)) {
            total += hotel.price || 2000 // Default price if not specified
          }
        })
      })
    })

    // Calculate travel costs
    const allTravelOptions = [
      ...travelOptionsData.outbound.options,
      ...travelOptionsData.return.options
    ]
    
    allTravelOptions.forEach((option: any, index: number) => {
      if (selectedTravelOptions.has(index.toString())) {
        // Calculate cost from segments if available
        const segmentCost = option.segments?.reduce((sum: number, segment: any) => {
          return sum + (segment.cost || 500) // Default segment cost
        }, 0) || 1500 // Default option cost
        total += segmentCost
      }
    })

    return total
  }

  // Handle booking
  const handleBookNow = () => {
    const totalCost = calculateTotalCost()
    const selectedItems = {
      accommodations: Array.from(selectedAccommodations),
      travelOptions: Array.from(selectedTravelOptions),
      totalCost
    }
    
    alert(`Booking confirmed! Total cost: ${formatCurrency(totalCost)}\n\nSelected items:\n- ${selectedAccommodations.size} accommodations\n- ${selectedTravelOptions.size} travel options\n\nThank you for your booking!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Your Trip</h1>
              <p className="text-gray-600 dark:text-gray-300">Select your preferred accommodations and travel options</p>
            </div>
          </div>
        </div>

        {/* Booking Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 flex-shrink-0">
                  <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
                  <TabsTrigger value="travel">Travel Options</TabsTrigger>
                </TabsList>

                {/* Accommodations Tab */}
                <TabsContent value="accommodations" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary" />
                      Select Accommodations
                    </h3>
                    
                    {Object.entries(accommodationsData).map(([category, days]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 capitalize">
                          {category.replace('_', ' ')} Budget Hotels
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(days as any).map(([dayNumber, dayData]: [string, any]) => 
                            dayData.stays.map((hotel: any, index: number) => {
                              const hotelId = `${category}-${dayNumber}-${index}`
                              const isSelected = selectedAccommodations.has(hotelId)
                              const rating = generateRating(hotel.name)
                              
                              return (
                                <Card 
                                  key={hotelId}
                                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                                  }`}
                                  onClick={() => toggleAccommodationSelection(hotelId)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <h5 className="font-medium text-sm leading-tight">
                                        {cleanHotelName(hotel.name)}
                                      </h5>
                                      <div className="flex items-center gap-1 ml-2">
                                        {renderStarRating(rating)}
                                        <span className="text-xs text-gray-600 ml-1">{rating}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                      <MapPin className="w-3 h-3" />
                                      <span>Shimla - Day {dayNumber}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          {formatCurrency(2000)}/night
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Wifi className="w-3 h-3 text-blue-500" />
                                        <Coffee className="w-3 h-3 text-brown-500" />
                                      </div>
                                    </div>
                                    
                                    {isSelected && (
                                      <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                                        <CheckCircle className="w-3 h-3" />
                                        Selected
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )
                            })
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Travel Options Tab */}
                <TabsContent value="travel" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Route className="w-5 h-5 text-primary" />
                      Select Travel Options
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {[...travelOptionsData.outbound.options, ...travelOptionsData.return.options].map((option: any, index: number) => {
                        const isSelected = selectedTravelOptions.has(index.toString())
                        
                        return (
                          <Card 
                            key={index}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                              isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                            }`}
                            onClick={() => toggleTravelOptionSelection(index.toString())}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Route className="w-4 h-4" />
                                  <div>
                                    <h5 className="font-medium text-sm">
                                      {option.title}
                                    </h5>
                                    <p className="text-xs text-gray-600">
                                      {option.summary}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">
                                    {formatCurrency(
                                      option.segments?.reduce((sum: number, seg: any) => sum + (seg.cost || 500), 0) || 1500
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {option.duration || 'Various times'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{option.segments?.length || 1} segments</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Route className="w-3 h-3" />
                                  <span>{index < travelOptionsData.outbound.options.length ? 'Outbound' : 'Return'}</span>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                                  <CheckCircle className="w-3 h-3" />
                                  Selected
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accommodations:</span>
                    <span>{selectedAccommodations.size} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Travel Options:</span>
                    <span>{selectedTravelOptions.size} selected</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total Cost:</span>
                    <span className="text-primary">{formatCurrency(calculateTotalCost())}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleBookNow}
                  className="w-full"
                  disabled={selectedAccommodations.size === 0 && selectedTravelOptions.size === 0}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Free cancellation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
