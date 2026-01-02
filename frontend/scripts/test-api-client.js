#!/usr/bin/env node

/**
 * Travel API Client Test Runner
 * Usage: node test-api-client.js
 */

const { executeTravelPlan, checkHealth } = require('./travel-api-client');

async function testApiClient() {
  console.log('🧪 Testing Travel API Client');
  console.log('============================\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const isHealthy = await checkHealth();
    
    if (!isHealthy) {
      console.log('❌ API health check failed. Make sure server is running on localhost:8000');
      return;
    }
    
    console.log('✅ API is healthy\n');

    // Test 2: Simple Travel Plan
    console.log('Test 2: Simple Travel Plan');
    const simplePlan = {
      home_city: "Pune",
      destination_city: "Himachal Pradesh",
      num_days: 8,
      interests: ["history", "culture", "food"]
    };

    console.log('📋 Plan Details:', simplePlan);
    
    const result = await executeTravelPlan(simplePlan);
    
    console.log('\n✅ Travel plan generated successfully!');
    console.log('📊 Result Summary:');
    console.log(`   • Itinerary Days: ${result.itinerary?.num_days || 'N/A'}`);
    console.log(`   • Travel Routes: ${result.travelOptions?.length || 0}`);
    console.log(`   • Food Outlets: ${result.foodOptions?.outlets?.length || 0}`);
    
    // Save detailed results
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(result, null, 2));
    console.log(`💾 Detailed results saved to: ${filename}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting Tips:');
      console.log('   1. Make sure the API server is running on localhost:8000');
      console.log('   2. Check if the server endpoints are accessible');
      console.log('   3. Verify firewall settings');
    }
    
    process.exit(1);
  }
}

// Custom travel plan examples
const EXAMPLE_PLANS = {
  short: {
    home_city: "Bangalore",
    destination_city: "Mysore",
    num_days: 2,
    interests: ["temples", "palaces", "local food"]
  },
  
  medium: {
    home_city: "Mumbai",
    destination_city: "Goa",
    num_days: 4,
    interests: ["beaches", "nightlife", "seafood", "water sports"]
  },
  
  long: {
    home_city: "Chennai",
    destination_city: "Kerala",
    num_days: 7,
    interests: ["backwaters", "hill stations", "ayurveda", "cultural shows"]
  }
};

async function runCustomPlan(planType = 'short') {
  if (!EXAMPLE_PLANS[planType]) {
    console.error(`❌ Unknown plan type: ${planType}`);
    console.log(`Available plans: ${Object.keys(EXAMPLE_PLANS).join(', ')}`);
    return;
  }
  
  console.log(`🎯 Running ${planType} travel plan example`);
  
  try {
    const result = await executeTravelPlan(EXAMPLE_PLANS[planType]);
    console.log(`✅ ${planType} plan completed successfully!`);
    return result;
  } catch (error) {
    console.error(`❌ ${planType} plan failed:`, error.message);
    throw error;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'test':
      testApiClient();
      break;
      
    case 'plan':
      const planType = args[1] || 'short';
      runCustomPlan(planType);
      break;
      
    case 'health':
      checkHealth().then(healthy => {
        console.log(healthy ? '✅ API is healthy' : '❌ API is not healthy');
        process.exit(healthy ? 0 : 1);
      });
      break;
      
    default:
      console.log('🌟 Travel API Client Test Runner');
      console.log('');
      console.log('Usage:');
      console.log('  node test-api-client.js test          # Run full test suite');
      console.log('  node test-api-client.js plan [type]   # Run specific plan (short/medium/long)');
      console.log('  node test-api-client.js health        # Check API health');
      console.log('');
      console.log('Examples:');
      console.log('  node test-api-client.js test');
      console.log('  node test-api-client.js plan medium');
      console.log('  node test-api-client.js health');
      break;
  }
}

module.exports = {
  testApiClient,
  runCustomPlan,
  EXAMPLE_PLANS
};
