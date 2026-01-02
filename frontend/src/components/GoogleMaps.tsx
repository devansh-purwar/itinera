"use client"

import {useEffect, useState} from 'react';
import {
    APIProvider,
    Map,
    useMapsLibrary,
    useMap   
} from '@vis.gl/react-google-maps';

interface GoogleMapsProps {
  startPoint: string;
  endPoint: string;
  travelMode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING';
  apiKey?: string;
}

interface DirectionsProps {
  startPoint: string;
  endPoint: string;
  travelMode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING';
  onTravelModeChange?: (mode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING') => void;
}

// Travel mode configuration with icons and labels
const travelModes = [
  { mode: 'DRIVING' as const, icon: '🚗', label: 'Drive' },
  { mode: 'WALKING' as const, icon: '🚶', label: 'Walk' },
  { mode: 'TRANSIT' as const, icon: '🚌', label: 'Transit' },
];

const Directions = ({ startPoint, endPoint, travelMode, onTravelModeChange }: DirectionsProps) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  // Initialize the directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    
    setDirectionsService(new routesLibrary.DirectionsService());
    
    // Create a new renderer instance
    const renderer = new routesLibrary.DirectionsRenderer({ 
      map,
      suppressMarkers: false,
      draggable: false,
    });
    setDirectionsRenderer(renderer);

    return () => {
      // Clean up the previous renderer
      if (renderer) {
        renderer.setMap(null);
      }
    };
  }, [routesLibrary, map]);

  // Use directions service
  useEffect(() => {
    if (!directionsService || !routesLibrary || !map) return;
    
    // Create a fresh renderer for each travel mode change
    const renderer = new routesLibrary.DirectionsRenderer({ 
      map,
      suppressMarkers: false,
      draggable: false,
    });
    setDirectionsRenderer(renderer);
    
    // Reset routes and route index when travel mode changes
    setRoutes([]);
    setRouteIndex(0);
    setIsLoading(true);
    setError(null);
    
    directionsService
      .route({
        origin: startPoint,
        destination: endPoint,
        travelMode: google.maps.TravelMode[travelMode],
        provideRouteAlternatives: true,
      })
      .then(response => {
        renderer.setDirections(response);
        setRoutes(response.routes);
        setRouteIndex(0); // Reset to first route
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching directions:', error);
        setRoutes([]); // Clear routes on error
        setIsLoading(false);
        setError(`No routes found for ${travelMode.toLowerCase()} between these locations`);
      });

    return () => {
      // Clean up when component unmounts or effect re-runs
      if (renderer) {
        renderer.setMap(null);
      }
    };
  }, [directionsService, routesLibrary, map, startPoint, endPoint, travelMode]);

  // Update direction route
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  return (
    <>
      {/* Travel Mode Selector */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200 z-10">
        <div className="flex gap-1">
          {travelModes.map((mode) => (
            <button
              key={mode.mode}
              onClick={() => onTravelModeChange?.(mode.mode)}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                travelMode === mode.mode
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              title={mode.label}
            >
              <div className="text-sm">{mode.icon}</div>
              <div className="text-[10px] mt-1">{mode.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Route Information */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 max-w-xs z-10">
        {isLoading ? (
          <div className="text-sm text-gray-600">
            <div className="animate-pulse">Loading {travelMode.toLowerCase()} route...</div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">
            <div className="font-medium mb-1">⚠️ Route Error</div>
            <div className="text-xs">{error}</div>
          </div>
        ) : leg ? (
          <>
            <h4 className="font-medium text-sm mb-2 text-black/70">
              {selected.summary || `${travelMode.charAt(0).toUpperCase() + travelMode.slice(1).toLowerCase()} Route`}
            </h4>
            <div className="text-xs space-y-1">
              <p className="text-gray-600">
                {leg.start_address.split(',')[0]} → {leg.end_address.split(',')[0]}
              </p>
              <div className="flex gap-4">
                <span className="text-blue-600">📍 {leg.distance?.text}</span>
                <span className="text-green-600">⏱️ {leg.duration?.text}</span>
              </div>
            </div>

            {routes.length > 1 && routes.filter(route => route.summary && route.summary.trim()).length > 0 && (
              <div className="mt-2">
                <h5 className="text-xs font-medium mb-1">Other Routes:</h5>
                <div className="space-y-1">
                  {routes
                    .map((route, index) => ({ route, originalIndex: index }))
                    .filter(({ route }) => route.summary && route.summary.trim())
                    .map(({ route, originalIndex }) => (
                      <button
                        key={originalIndex}
                        onClick={() => setRouteIndex(originalIndex)}
                        className={`text-xs px-2 py-1 rounded border w-full text-left ${
                          originalIndex === routeIndex 
                            ? 'bg-blue-100 border-blue-300 text-blue-700' 
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {route.summary}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-600">
            Select travel mode to view route
          </div>
        )}
      </div>
    </>
  );
};

const GoogleMaps = ({ startPoint, endPoint, travelMode, apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }: GoogleMapsProps) => {
  const [center, setCenter] = useState({ lat: 18.524470, lng: 73.878052 }); // Default to Pune 18.524470, 73.878052
  const [currentTravelMode, setCurrentTravelMode] = useState<'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING'>(travelMode);

  // Update current travel mode when prop changes
  useEffect(() => {
    setCurrentTravelMode(travelMode);
  }, [travelMode]);

  const handleTravelModeChange = (mode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING') => {
    setCurrentTravelMode(mode);
  };

  
//   // Calculate center point between start and end
//   useEffect(() => {
//     const geocoder = new google.maps.Geocoder();
    
//     // Geocode both points to get their coordinates
//     Promise.all([
//       new Promise<google.maps.LatLng>((resolve, reject) => {
//         geocoder.geocode({ address: startPoint }, (results, status) => {
//           if (status === 'OK' && results?.[0]) {
//             resolve(results[0].geometry.location);
//           } else {
//             reject(status);
//           }
//         });
//       }),
//       new Promise<google.maps.LatLng>((resolve, reject) => {
//         geocoder.geocode({ address: endPoint }, (results, status) => {
//           if (status === 'OK' && results?.[0]) {
//             resolve(results[0].geometry.location);
//           } else {
//             reject(status);
//           }
//         });
//       })
//     ]).then(([startLatLng, endLatLng]) => {
//       // Calculate center point
//       const centerLat = (startLatLng.lat() + endLatLng.lat()) / 2;
//       const centerLng = (startLatLng.lng() + endLatLng.lng()) / 2;
//       setCenter({ lat: centerLat, lng: centerLng });
//     }).catch(error => {
//       console.error('Error geocoding addresses:', error);
//     });
//   }, [startPoint, endPoint]);

  if (!apiKey) {
    return (
      <div className="p-4 border border-red-300 rounded-md bg-red-50">
        <p className="text-red-600">Google Maps API key is required. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[28rem] border rounded-lg overflow-hidden relative">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultZoom={10}
          defaultCenter={center}
          gestureHandling={'cooperative'}
          disableDefaultUI={false}
          fullscreenControl={true}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <Directions
            startPoint={startPoint}
            endPoint={endPoint}
            travelMode={currentTravelMode}
            onTravelModeChange={handleTravelModeChange}
          />
        </Map>
      </APIProvider>
    </div>
  );
};

export default GoogleMaps;

