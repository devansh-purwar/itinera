const axios = require('axios');

// Base configuration
const BASE_URL = 'http://localhost:8000';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Enhanced logging function
function log(message, data = null) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Error handling function
function handleError(error, context) {
  console.error(`[ERROR] ${context}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url
  });
}

// Main travel planning function
async function executeTravelPlan(planData) {
  try {
    log('🚀 Starting Travel Planning Process');
    
    // Step 1: Generate Itinerary
    log('📅 Step 1: Generating itinerary...');
    const itineraryResponse = await generateItinerary(planData);
    
    if (!itineraryResponse || !itineraryResponse.days) {
      throw new Error('Invalid itinerary response received');
    }
    
    log(`✅ Itinerary generated for ${itineraryResponse.num_days} days`);
    
    // Step 2: Get travel options for each pair of places
    log('🚗 Step 2: Getting travel options...');
    const travelOptions = await getTravelOptionsForItinerary(itineraryResponse);
    
    // Step 3: Get food options for destination city
    log('🍽️ Step 3: Getting food recommendations...');
    const foodOptions = await getFoodOptions(itineraryResponse.destination_city);
    
    // Compile final result
    const finalResult = {
      itinerary: itineraryResponse,
      travelOptions: travelOptions,
      foodOptions: foodOptions,
      generatedAt: new Date().toISOString()
    };
    
    log('🎉 Travel planning completed successfully!');
    return finalResult;
    
  } catch (error) {
    handleError(error, 'Travel Plan Execution');
    throw error;
  }
}

// Generate itinerary
async function generateItinerary(planData) {
  try {
    const itineraryRequest = {
      home_city: planData.home_city,
      destination_city: planData.destination_city,
      num_days: planData.num_days || 4,
      interests: planData.interests || []
    };
    
    log('Making itinerary request', itineraryRequest);
    
    const response = await api.post('/travel/itinerary', itineraryRequest);
    
    log('✅ Itinerary response received');
    return response.data;
    
  } catch (error) {
    handleError(error, 'Generate Itinerary');
    throw error;
  }
}

// Get travel options for itinerary locations
async function getTravelOptionsForItinerary(itinerary) {
  const travelOptions = [];
  
  try {
    // Create unique pairs of cities from the itinerary
    const cityPairs = new Set();
    
    // Add home to destination pair
    cityPairs.add(`${itinerary.home_city}|${itinerary.destination_city}`);
    
    // Extract cities from itinerary entities
    const cities = new Set([itinerary.home_city, itinerary.destination_city]);
    
    // Add cities mentioned in the itinerary
    itinerary.days.forEach(day => {
      day.entities.forEach(entity => {
        cities.add(entity.name);
      });
    });
    
    const cityArray = Array.from(cities);
    
    // Generate pairs for inter-city travel
    for (let i = 0; i < cityArray.length; i++) {
      for (let j = i + 1; j < cityArray.length; j++) {
        cityPairs.add(`${cityArray[i]}|${cityArray[j]}`);
      }
    }
    
    log(`Getting travel options for ${cityPairs.size} city pairs`);
    
    // Get travel options for each pair
    for (const pairString of cityPairs) {
      const [origin, destination] = pairString.split('|');
      
      try {
        log(`🔍 Getting travel options: ${origin} → ${destination}`);
        
        const travelRequest = {
          origin_city: origin,
          destination_city: destination,
          recency_filter: null
        };
        
        const response = await api.post('/travel/options', travelRequest);
        
        travelOptions.push({
          route: `${origin} → ${destination}`,
          options: response.data
        });
        
        // Add small delay to prevent API overload
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        log(`⚠️ Failed to get travel options for ${origin} → ${destination}`);
        handleError(error, `Travel Options ${origin} → ${destination}`);
        
        // Continue with other pairs even if one fails
        travelOptions.push({
          route: `${origin} → ${destination}`,
          error: error.message
        });
      }
    }
    
    log(`✅ Collected travel options for ${travelOptions.length} routes`);
    return travelOptions;
    
  } catch (error) {
    handleError(error, 'Get Travel Options');
    throw error;
  }
}

// Get food options for a city
async function getFoodOptions(city, preferences = []) {
  try {
    const foodRequest = {
      city: city,
      cuisine_preferences: preferences,
      price_level: null, // Can be "$", "$$", "$$$"
      recency_filter: null
    };
    
    log(`🍽️ Getting food options for ${city}`, foodRequest);
    
    const response = await api.post('/travel/food', foodRequest);
    
    log(`✅ Found ${response.data.outlets?.length || 0} food outlets in ${city}`);
    return response.data;
    
  } catch (error) {
    handleError(error, `Food Options for ${city}`);
    // Return empty result instead of failing
    return {
      city: city,
      outlets: [],
      error: error.message
    };
  }
}

// Health check function
async function checkHealth() {
  try {
    log('🏥 Checking API health...');
    const response = await api.get('/health/detailed');
    log('✅ API is healthy', response.data);
    return true;
  } catch (error) {
    handleError(error, 'Health Check');
    return false;
  }
}

// Example usage and test function
async function runExample() {
  try {
    // Check if API is available
    const isHealthy = await checkHealth();
    if (!isHealthy) {
      throw new Error('API is not available. Please ensure the server is running on localhost:8000');
    }
    
    // Example travel plan data
    const examplePlan = {
      home_city: "Mumbai",
      destination_city: "Goa",
      num_days: 3,
      interests: ["beaches", "nightlife", "local cuisine", "water sports"]
    };
    
    log('🎯 Starting example travel plan', examplePlan);
    
    const result = await executeTravelPlan(examplePlan);
    
    // Save result to file
    const fs = require('fs');
    const outputFile = `travel-plan-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    
    log(`💾 Complete travel plan saved to: ${outputFile}`);
    log('📊 Summary:', {
      itinerary_days: result.itinerary.num_days,
      travel_routes: result.travelOptions.length,
      food_outlets: result.foodOptions.outlets?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Example execution failed:', error.message);
    process.exit(1);
  }
}

// Export functions for use as module
module.exports = {
  executeTravelPlan,
  generateItinerary,
  getTravelOptionsForItinerary,
  getFoodOptions,
  checkHealth,
  runExample
};

// Run example if script is executed directly
if (require.main === module) {
  console.log('🌟 Travel Planner API Client');
  console.log('================================');
  runExample();
}
