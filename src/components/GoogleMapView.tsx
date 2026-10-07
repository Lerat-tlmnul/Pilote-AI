// Source: Google Maps Platform Code Assist
import React, { useEffect, useState } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap 
} from '@vis.gl/react-google-maps';
import { Restaurant } from '../types';
import { Star, MapPin, ExternalLink, Navigation2 } from 'lucide-react';

interface GoogleMapViewProps {
  restaurants: Restaurant[];
  selectedIndex: number;
  onSelectRestaurant: (index: number) => void;
  apiKey?: string;
  onError?: (err: unknown) => void;
}

// Inner helper component that reacts to selectedIndex changes and smoothly pans the Google Map
function MapPanController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof lat !== 'number' || typeof lng !== 'number') return;
    map.panTo({ lat, lng });
    map.setZoom(15);
  }, [map, lat, lng]);

  return null;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  restaurants,
  selectedIndex,
  onSelectRestaurant,
  apiKey,
}) => {
  const [activeInfoWindow, setActiveInfoWindow] = useState<number | null>(selectedIndex);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Sync active info window with selected index
  useEffect(() => {
    setActiveInfoWindow(selectedIndex);
  }, [selectedIndex]);

  const effectiveKey = apiKey || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 'AIzaSyD-eL5y6dkCnX_qXoWF2FpXCcsT-X4Adhs';
  const current = restaurants[selectedIndex] || restaurants[0];
  const centerLat = current?.lat || 48.8566;
  const centerLng = current?.lng || 2.3522;

  return (
    <div className="relative w-full h-full min-h-[260px] sm:min-h-[300px]">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <APIProvider 
        apiKey={effectiveKey} 
        libraries={['marker', 'places']}
        onError={() => setQuotaExceeded(true)}
      >
        <Map
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_git_agentskills_v1']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={true}
          streetViewControl={true}
          fullscreenControl={false}
          zoomControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Smooth camera pan on restaurant selection */}
          <MapPanController lat={current?.lat || centerLat} lng={current?.lng || centerLng} />

          {/* Render real Advanced Markers for each restaurant */}
          {restaurants.map((resto, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <AdvancedMarker
                key={resto.name + idx}
                position={{ lat: resto.lat, lng: resto.lng }}
                title={`${resto.name} - ${resto.cuisine}`}
                onClick={() => {
                  onSelectRestaurant(idx);
                  setActiveInfoWindow(idx);
                }}
                zIndex={isSelected ? 50 : 10}
              >
                <Pin
                  background={isSelected ? '#0284c7' : '#e11d48'}
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={isSelected ? 1.25 : 1.0}
                />
              </AdvancedMarker>
            );
          })}

          {/* Real Google Maps InfoWindow on selected point */}
          {activeInfoWindow !== null && restaurants[activeInfoWindow] && (
            <InfoWindow
              position={{ 
                lat: restaurants[activeInfoWindow].lat, 
                lng: restaurants[activeInfoWindow].lng 
              }}
              onCloseClick={() => setActiveInfoWindow(null)}
              pixelOffset={[0, -38]}
            >
              <div className="p-1 max-w-[220px] text-slate-800">
                <div className="flex items-center gap-1.5 justify-between">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {restaurants[activeInfoWindow].name}
                  </h4>
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    {restaurants[activeInfoWindow].rating}
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {restaurants[activeInfoWindow].cuisine} • {restaurants[activeInfoWindow].priceRange}
                </p>

                <p className="text-[10px] text-slate-600 mt-1 flex items-start gap-1 line-clamp-2">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                  <span>{restaurants[activeInfoWindow].address}</span>
                </p>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      restaurants[activeInfoWindow].name + ' ' + restaurants[activeInfoWindow].address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-0.5"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      restaurants[activeInfoWindow].address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5"
                  >
                    <Navigation2 className="w-2.5 h-2.5" />
                    <span>Itinéraire</span>
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
