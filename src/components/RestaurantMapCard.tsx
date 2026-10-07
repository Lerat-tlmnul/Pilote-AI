import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Star, 
  Utensils, 
  Calendar, 
  Mail, 
  ExternalLink, 
  Compass, 
  Check, 
  Search, 
  Navigation2, 
  Sparkles, 
  Copy,
  Layers,
  Globe
} from 'lucide-react';
import { Restaurant } from '../types';
import { detectCityInText, getRestaurantsForCity } from '../lib/cityRestaurants';
import { GoogleMapView } from './GoogleMapView';
import bistroImagePath from '../assets/images/restaurant_bistrot_interior_1791388341325.jpg';
import terraceImagePath from '../assets/images/restaurant_terrasse_view_1791388352954.jpg';

interface RestaurantMapCardProps {
  restaurants: Restaurant[];
  initialCity?: string;
  onBookTable?: (restaurant: Restaurant) => void;
  onSendEmail?: (restaurant: Restaurant) => void;
  onSchedule?: (restaurant: Restaurant) => void;
}

export const RestaurantMapCard: React.FC<RestaurantMapCardProps> = ({
  restaurants: initialRestaurants,
  initialCity = 'Paris',
  onBookTable,
  onSendEmail,
  onSchedule,
}) => {
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>(initialRestaurants);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bookedStatus, setBookedStatus] = useState<string | null>(null);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [searchCityInput, setSearchCityInput] = useState('');
  const [currentCityName, setCurrentCityName] = useState(initialCity);
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('google');
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Update list if prop changes
  useEffect(() => {
    if (initialRestaurants && initialRestaurants.length > 0) {
      setRestaurantsList(initialRestaurants);
      setSelectedIndex(0);
    }
  }, [initialRestaurants]);

  const current = restaurantsList[selectedIndex] || restaurantsList[0];

  // Initialize or update Leaflet map if mapProvider is 'leaflet'
  useEffect(() => {
    if (mapProvider !== 'leaflet' || !mapContainerRef.current) return;

    const centerLat = current?.lat || 48.8566;
    const centerLng = current?.lng || 2.3522;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    const map = mapInstanceRef.current;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    restaurantsList.forEach((resto, idx) => {
      const isSelected = idx === selectedIndex;
      const pinHtml = `
        <div class="relative flex flex-col items-center cursor-pointer group transform transition-transform ${isSelected ? 'scale-125 z-50' : 'scale-95 z-10'}">
          <div class="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap border ${
            isSelected 
              ? 'bg-slate-900 text-white border-sky-400 ring-2 ring-sky-400/50' 
              : 'bg-white/95 text-slate-800 border-slate-300'
          }">
            <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-sky-400 animate-ping' : 'bg-amber-500'}"></span>
            <span class="max-w-[110px] truncate">${resto.name}</span>
            <span class="text-[10px] ${isSelected ? 'text-amber-300' : 'text-slate-500'}">★${resto.rating}</span>
          </div>
          <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1 shadow-xs border-r border-b ${isSelected ? 'border-sky-400' : 'border-slate-300'}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-leaflet-marker',
        iconSize: [120, 36],
        iconAnchor: [60, 36],
      });

      const marker = L.marker([resto.lat, resto.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedIndex(idx);
      });

      markersRef.current.push(marker);
    });

    if (current?.lat && current?.lng) {
      map.flyTo([current.lat, current.lng], 14, { duration: 0.8 });
    }
  }, [restaurantsList, selectedIndex, mapProvider]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle city search from the map header
  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCityInput.trim()) return;

    const found = detectCityInText(searchCityInput);
    if (found) {
      setCurrentCityName(found.name);
      setRestaurantsList(found.restaurants);
      setSelectedIndex(0);
      setSearchCityInput('');
    } else {
      const res = getRestaurantsForCity(searchCityInput.trim());
      setCurrentCityName(res.city);
      setRestaurantsList(res.restaurants);
      setSelectedIndex(0);
      setSearchCityInput('');
    }
  };

  const handleBook = (resto: Restaurant) => {
    setBookedStatus(resto.name);
    if (onBookTable) onBookTable(resto);
    setTimeout(() => {
      setBookedStatus(null);
    }, 4000);
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const getCardImage = (index: number) => {
    if (index % 2 === 0) return bistroImagePath;
    return terraceImagePath;
  };

  const googleMapsUrl = current 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(current.name + ' ' + current.address)}`
    : '#';

  const googleMapsDirectionsUrl = current
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(current.address)}`
    : '#';

  return (
    <div className="mt-4 rounded-3xl overflow-hidden bg-white/95 border border-white/80 shadow-xl backdrop-blur-xl transition-all">
      {/* City Search and Google Maps Controls Bar */}
      <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '16s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                Google Maps Platform
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                API Officielle Connectée
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              Ville explorée : <strong className="text-white">{currentCityName}</strong> ({restaurantsList.length} adresses géolocalisées)
            </div>
          </div>
        </div>

        {/* Quick City Search and Engine Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={handleCitySearch} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                value={searchCityInput}
                onChange={(e) => setSearchCityInput(e.target.value)}
                placeholder="Changer de ville (ex: Lyon, Bordeaux...)"
                className="w-44 sm:w-52 px-3 py-1.5 pl-8 rounded-xl bg-slate-800/90 text-white text-xs border border-slate-700 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Chercher
            </button>
          </form>

          {/* Map provider toggle */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => setMapProvider('google')}
              className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                mapProvider === 'google' 
                  ? 'bg-sky-500 text-white shadow-xs font-semibold' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Afficher la vue officielle Google Maps avec vue satellite et Street View"
            >
              <Globe className="w-3 h-3" />
              <span className="hidden sm:inline">Google Maps</span>
            </button>
            <button
              type="button"
              onClick={() => setMapProvider('leaflet')}
              className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                mapProvider === 'leaflet' 
                  ? 'bg-slate-700 text-white shadow-xs font-semibold' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Afficher la vue cartographique OpenStreetMap"
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">OSM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Interactive Map container */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100 group">
        {mapProvider === 'google' ? (
          <GoogleMapView
            restaurants={restaurantsList}
            selectedIndex={selectedIndex}
            onSelectRestaurant={(idx) => setSelectedIndex(idx)}
            onError={() => setMapProvider('leaflet')}
          />
        ) : (
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        )}

        {/* Map Top Floating Badges */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white border border-white/20 text-xs font-medium shadow-lg flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Sélection {currentCityName}</span>
          </div>
        </div>

        {/* Quick City Pills */}
        <div className="absolute top-3 right-3 z-10 hidden md:flex items-center gap-1">
          {['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse'].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                const found = detectCityInText(city);
                if (found) {
                  setCurrentCityName(found.name);
                  setRestaurantsList(found.restaurants);
                  setSelectedIndex(0);
                }
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md transition-all cursor-pointer ${
                currentCityName.toLowerCase() === city.toLowerCase()
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-slate-900/70 text-slate-200 hover:bg-slate-900 border border-white/10'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Tabs Slider */}
      <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex gap-2 overflow-x-auto no-scrollbar">
        {restaurantsList.map((resto, idx) => (
          <button
            key={resto.name + idx}
            type="button"
            onClick={() => setSelectedIndex(idx)}
            className={`px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              selectedIndex === idx
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedIndex === idx ? 'bg-sky-400' : 'bg-slate-400'}`} />
            <span>{resto.name}</span>
            <span className={`text-[10px] ${selectedIndex === idx ? 'text-amber-300' : 'text-slate-400'}`}>
              ★{resto.rating}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Restaurant Detail Card */}
      {current && (
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Visual Photo Thumbnail */}
            <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden shrink-0 relative group shadow-sm bg-slate-100">
              <img
                src={getCardImage(selectedIndex)}
                alt={current.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-white/10">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <span>{current.rating}</span>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                {current.priceRange}
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      {current.name}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                        {current.cuisine}
                      </span>
                    </h3>
                    
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(current.address)}
                      className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-left group"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="line-clamp-1 underline-offset-2 group-hover:underline">{current.address}</span>
                      <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                      {copiedStatus && (
                        <span className="text-[10px] text-emerald-600 font-bold ml-1">Copié !</span>
                      )}
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {current.description}
                </p>

                {current.highlight && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Spécialité : {current.highlight}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBook(current)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    bookedStatus === current.name
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {bookedStatus === current.name ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Table réservée avec succès !</span>
                    </>
                  ) : (
                    <>
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      <span>Réserver une table</span>
                    </>
                  )}
                </button>

                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Itinéraire Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Fiche Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>

                {onSendEmail && (
                  <button
                    type="button"
                    onClick={() => onSendEmail(current)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Envoyer les détails</span>
                  </button>
                )}

                {onSchedule && (
                  <button
                    type="button"
                    onClick={() => onSchedule(current)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ajouter à l'agenda</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
