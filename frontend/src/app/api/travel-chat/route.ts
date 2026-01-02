import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText, type UIMessage, tool } from "ai"
import { z } from "zod"

export const maxDuration = 30

const travelPlanningTools = {
  generateItinerary: tool({
    description: "Generate a detailed travel itinerary for a destination",
    inputSchema: z.object({
      destination: z.string().describe("The travel destination"),
      duration: z.number().describe("Number of days for the trip"),
      budget: z.string().optional().describe("Budget range (low, medium, high)"),
      interests: z.array(z.string()).optional().describe("Travel interests and preferences"),
      travelStyle: z.string().optional().describe("Travel style (luxury, budget, adventure, cultural, family)"),
    }),
    execute: async ({ destination, duration, budget, interests, travelStyle }) => {
      // Enhanced itinerary generation with more detailed activities
      const activities = {
        cultural: ["Visit museums", "Explore historic sites", "Traditional performances", "Local workshops"],
        adventure: ["Hiking trails", "Water sports", "Extreme activities", "Nature exploration"],
        luxury: ["Fine dining", "Spa treatments", "Private tours", "Premium experiences"],
        budget: ["Free walking tours", "Local markets", "Public transportation", "Street food"],
        family: ["Kid-friendly attractions", "Interactive museums", "Parks and playgrounds", "Family restaurants"],
      }

      const selectedActivities = activities[travelStyle as keyof typeof activities] || activities.cultural

      return {
        destination,
        duration,
        travelStyle: travelStyle || "cultural",
        itinerary: Array.from({ length: duration }, (_, i) => ({
          day: i + 1,
          title:
            i === 0
              ? `Arrival in ${destination}`
              : i === duration - 1
                ? `Departure from ${destination}`
                : `Explore ${destination} - Day ${i + 1}`,
          activities: selectedActivities.slice(0, 3 + Math.floor(Math.random() * 2)).map((activity) => ({
            time: `${9 + i * 2}:00 AM`,
            activity,
            location: `${destination} ${["Center", "District", "Area", "Quarter"][Math.floor(Math.random() * 4)]}`,
          })),
          timeOfDay: "Full Day",
          estimatedCost:
            budget === "high"
              ? `$${200 + i * 50}-${300 + i * 50}`
              : budget === "low"
                ? `$${50 + i * 20}-${100 + i * 20}`
                : `$${100 + i * 30}-${200 + i * 30}`,
        })),
        budget: budget || "medium",
        totalEstimatedCost:
          budget === "high"
            ? `$${duration * 250}-${duration * 350}`
            : budget === "low"
              ? `$${duration * 75}-${duration * 125}`
              : `$${duration * 150}-${duration * 250}`,
        interests: interests || ["sightseeing", "local culture"],
      }
    },
  }),

  findAccommodations: tool({
    description: "Find hotel and accommodation recommendations with detailed comparisons",
    inputSchema: z.object({
      destination: z.string().describe("The travel destination"),
      checkIn: z.string().optional().describe("Check-in date"),
      checkOut: z.string().optional().describe("Check-out date"),
      budget: z.string().optional().describe("Budget range (low, medium, high)"),
      preferences: z.array(z.string()).optional().describe("Hotel preferences"),
      roomType: z.string().optional().describe("Room type preference"),
    }),
    execute: async ({ destination, checkIn, checkOut, budget, preferences, roomType }) => {
      const hotelTypes = {
        luxury: [
          { name: "Grand Palace Hotel", basePrice: 350, rating: 4.9, type: "Luxury Resort" },
          { name: "Royal Suites", basePrice: 420, rating: 4.8, type: "Luxury Hotel" },
          { name: "Premium Tower", basePrice: 380, rating: 4.7, type: "Business Hotel" },
        ],
        medium: [
          { name: "City Center Inn", basePrice: 180, rating: 4.5, type: "Boutique Hotel" },
          { name: "Garden View Hotel", basePrice: 220, rating: 4.4, type: "Mid-range Hotel" },
          { name: "Business Plaza", basePrice: 200, rating: 4.3, type: "Business Hotel" },
        ],
        low: [
          { name: "Backpacker Lodge", basePrice: 80, rating: 4.2, type: "Hostel" },
          { name: "Budget Inn", basePrice: 120, rating: 4.1, type: "Budget Hotel" },
          { name: "Traveler Rest", basePrice: 100, rating: 4.0, type: "Guesthouse" },
        ],
      }

      const selectedHotels = hotelTypes[budget as keyof typeof hotelTypes] || hotelTypes.medium

      return {
        destination,
        checkIn: checkIn || "Flexible dates",
        checkOut: checkOut || "Flexible dates",
        hotels: selectedHotels.map((hotel) => ({
          name: hotel.name,
          rating: hotel.rating,
          pricePerNight: hotel.basePrice,
          amenities:
            budget === "high"
              ? ["Spa", "Rooftop Restaurant", "Fitness Center", "Pool", "Concierge", "Room Service"]
              : budget === "low"
                ? ["Free WiFi", "Shared Kitchen", "Laundry"]
                : ["Free WiFi", "Breakfast", "Fitness Center", "Business Center"],
          location: `${destination} ${["Center", "Downtown", "Historic District", "Business District"][Math.floor(Math.random() * 4)]}`,
          description: `${hotel.type} offering ${budget === "high"
              ? "luxury amenities and premium service"
              : budget === "low"
                ? "comfortable accommodation at great value"
                : "modern facilities and convenient location"
            }`,
          pros:
            budget === "high"
              ? ["Exceptional service", "Prime location", "Luxury amenities"]
              : budget === "low"
                ? ["Great value", "Clean facilities", "Friendly staff"]
                : ["Good location", "Modern rooms", "Reliable service"],
          cons:
            budget === "high"
              ? ["Expensive", "Can be crowded"]
              : budget === "low"
                ? ["Basic amenities", "Shared facilities"]
                : ["Limited luxury features", "Standard service"],
          roomType: roomType || "Standard Room",
          cancellationPolicy: "Free cancellation up to 24 hours before check-in",
        })),
      }
    },
  }),

  findRestaurants: tool({
    description: "Find restaurant recommendations with cuisine variety and detailed information",
    inputSchema: z.object({
      destination: z.string().describe("The travel destination"),
      cuisine: z.string().optional().describe("Preferred cuisine type"),
      budget: z.string().optional().describe("Budget range (low, medium, high)"),
      mealType: z.string().optional().describe("Meal type (breakfast, lunch, dinner)"),
      dietaryRestrictions: z.array(z.string()).optional().describe("Dietary restrictions or preferences"),
    }),
    execute: async ({ destination, cuisine, budget, mealType, dietaryRestrictions }) => {
      const cuisineTypes = ["Local", "Italian", "Japanese", "French", "Indian", "Mexican", "Thai", "Mediterranean"]
      const selectedCuisine = cuisine || cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)]

      const restaurantData = {
        high: [
          { name: "Michelin Star Restaurant", price: "$$$", rating: 4.9, type: "Fine Dining" },
          { name: "Celebrity Chef Bistro", price: "$$$", rating: 4.8, type: "Upscale Casual" },
          { name: "Rooftop Gourmet", price: "$$$$", rating: 4.7, type: "Fine Dining" },
        ],
        medium: [
          { name: "Local Favorite Cafe", price: "$$", rating: 4.5, type: "Casual Dining" },
          { name: "Traditional Kitchen", price: "$$", rating: 4.4, type: "Family Restaurant" },
          { name: "Modern Bistro", price: "$$", rating: 4.3, type: "Contemporary" },
        ],
        low: [
          { name: "Street Food Market", price: "$", rating: 4.2, type: "Street Food" },
          { name: "Local Diner", price: "$", rating: 4.1, type: "Casual" },
          { name: "Food Truck Plaza", price: "$", rating: 4.0, type: "Fast Casual" },
        ],
      }

      const selectedRestaurants = restaurantData[budget as keyof typeof restaurantData] || restaurantData.medium

      return {
        destination,
        cuisine: selectedCuisine,
        mealType: mealType || "Any",
        restaurants: selectedRestaurants.map((restaurant, index) => ({
          name: restaurant.name,
          cuisine: selectedCuisine,
          rating: restaurant.rating,
          priceRange: restaurant.price,
          hours:
            mealType === "breakfast"
              ? "7:00 AM - 11:00 AM"
              : mealType === "lunch"
                ? "11:30 AM - 3:00 PM"
                : mealType === "dinner"
                  ? "6:00 PM - 11:00 PM"
                  : "11:00 AM - 11:00 PM",
          phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          location: `${destination} ${["Center", "Old Town", "Marina", "Arts District"][index % 4]}`,
          specialties:
            budget === "high"
              ? ["Signature dishes", "Wine pairing", "Chef's tasting menu"]
              : budget === "low"
                ? ["Local favorites", "Quick service", "Authentic flavors"]
                : ["Popular dishes", "Fresh ingredients", "Seasonal menu"],
          description: `${restaurant.type} serving ${selectedCuisine.toLowerCase()} cuisine with ${budget === "high"
              ? "exceptional quality and presentation"
              : budget === "low"
                ? "authentic flavors at great prices"
                : "quality ingredients and friendly service"
            }`,
          dietaryOptions: dietaryRestrictions?.length
            ? dietaryRestrictions.map((restriction) => `${restriction}-friendly options available`)
            : ["Vegetarian options", "Gluten-free available"],
          reservationRequired: budget === "high",
          averageWaitTime: budget === "high" ? "30-45 minutes" : budget === "low" ? "5-15 minutes" : "15-30 minutes",
        })),
      }
    },
  }),

  getLocalInformation: tool({
    description: "Get local information including transportation, weather, culture, and practical tips",
    inputSchema: z.object({
      destination: z.string().describe("The travel destination"),
      infoType: z
        .string()
        .optional()
        .describe("Type of information needed (transportation, weather, culture, safety, currency)"),
    }),
    execute: async ({ destination, infoType }) => {
      const transportationInfo = {
        publicTransport: ["Metro/Subway system", "Bus network", "Taxi services", "Ride-sharing apps"],
        costs: { metro: "$2-5 per ride", bus: "$1-3 per ride", taxi: "$10-20 average trip" },
        tips: ["Get a day pass for unlimited rides", "Download local transport app", "Keep cash for some services"],
      }

      const culturalInfo = {
        customs: ["Local greeting customs", "Tipping etiquette", "Dress codes for religious sites", "Business hours"],
        language: { primary: "Local language", common: "English widely spoken in tourist areas" },
        etiquette: ["Respect local traditions", "Photography restrictions", "Bargaining customs"],
      }

      const safetyInfo = {
        emergency: { police: "911", medical: "911", tourist: "+1-800-TOURIST" },
        tips: ["Keep copies of documents", "Use hotel safe", "Stay in well-lit areas at night"],
        areas: ["Tourist areas are generally safe", "Avoid isolated areas after dark"],
      }

      return {
        destination,
        transportation: transportationInfo,
        culture: culturalInfo,
        safety: safetyInfo,
        weather: {
          current: "Check local weather app for current conditions",
          seasonal: "Best time to visit varies by season",
          clothing: "Pack layers and comfortable walking shoes",
        },
        currency: {
          local: "Local currency",
          exchange: "ATMs widely available",
          cards: "Credit cards accepted at most establishments",
        },
        practicalTips: [
          "Download offline maps",
          "Learn basic local phrases",
          "Keep emergency contacts handy",
          "Register with embassy if required",
          "Get travel insurance",
        ],
      }
    },
  }),
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are Itinera AI, an expert AI travel planner assistant with deep knowledge of destinations worldwide. You help users plan amazing trips by:
        
        1. **Understanding Travel Preferences**: Ask about budget, interests, travel style, dietary restrictions, and special requirements
        2. **Creating Detailed Itineraries**: Generate day-by-day plans with specific activities, timing, and locations
        3. **Finding Perfect Accommodations**: Recommend hotels that match budget and preferences with pros/cons analysis
        4. **Suggesting Great Dining**: Find restaurants for all budgets with cuisine variety and dietary considerations
        5. **Providing Local Insights**: Share transportation, cultural, safety, and practical information
        
        **Communication Style**:
        - Be enthusiastic and encouraging about travel
        - Ask clarifying questions to personalize recommendations
        - Provide specific, actionable advice with details
        - Include practical tips and insider knowledge
        - Consider budget constraints and preferences
        
        **When users mention a destination or travel request**:
        - Automatically use tools to provide comprehensive information
        - Generate itineraries, find accommodations, and suggest restaurants
        - Include local information and practical tips
        - Offer alternatives and comparisons
        
        **Always consider**:
        - Budget constraints (low/medium/high)
        - Travel style (luxury/budget/adventure/cultural/family)
        - Dietary restrictions and preferences
        - Duration of stay and timing
        - Special interests and activities
        
        Make every interaction helpful, informative, and inspiring for their travel journey!`,
      },
      ...prompt,
    ],
    tools: travelPlanningTools,
    abortSignal: req.signal,
  })

  return result.toTextStreamResponse()
}
