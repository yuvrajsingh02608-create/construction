import { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';

export default function MapPicker({ lat, lng, radius, onLocationChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!window.L) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const initialLat = lat || 28.6139;
      const initialLng = lng || 77.2090;

      mapInstanceRef.current = window.L.map(mapRef.current).setView([initialLat, initialLng], 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Create draggable marker
      markerRef.current = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(mapInstanceRef.current);
      
      // Create radius circle
      circleRef.current = window.L.circle([initialLat, initialLng], {
        radius: radius || 300,
        color: '#CC0000',
        fillColor: '#CC0000',
        fillOpacity: 0.15
      }).addTo(mapInstanceRef.current);

      // Marker drag events
      markerRef.current.on('drag', (e) => {
        const position = e.target.getLatLng();
        circleRef.current.setLatLng(position);
        onLocationChange(position.lat, position.lng);
      });

      // Map click to move marker
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        circleRef.current.setLatLng([lat, lng]);
        onLocationChange(lat, lng);
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Update circle radius when prop changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius || 300);
    }
  }, [radius]);

  // Update marker/circle if lat/lng changed from outside
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
        const newPos = [lat, lng];
        markerRef.current.setLatLng(newPos);
        circleRef.current.setLatLng(newPos);
        mapInstanceRef.current.panTo(newPos);
      }
    }
  }, [lat, lng]);

  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      // Prioritize India by appending it and using location bias (approx center of India)
      const query = search.toLowerCase().includes('india') ? search : `${search}, India`;
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=22.0&lon=78.0&limit=10`);
      const data = await response.json();
      
      if (data && data.features && data.features.length > 0) {
        setSearchResults(data.features.map(f => {
          const props = f.properties;
          // Create a more descriptive name: [Name] - [Local Area/District], [City], [State]
          const main = props.name || props.street || '';
          const sub = [props.district, props.city, props.state]
            .filter(Boolean)
            .join(', ');
          
          return {
            display_name: sub ? `${main} (${sub})` : main,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0]
          };
        }));
      } else {
        // Fallback to searching without "India" suffix if no results
        const fallbackRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(search)}&limit=5`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData?.features) {
          setSearchResults(fallbackData.features.map(f => ({
            display_name: [f.properties.name, f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(', '),
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0]
          })));
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (res) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    onLocationChange(lat, lng);
    mapInstanceRef.current.setView([lat, lng], 16);
    markerRef.current.setLatLng([lat, lng]);
    circleRef.current.setLatLng([lat, lng]);
    setSearchResults([]);
    setSearch(res.display_name);
  };

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationChange(latitude, longitude);
        mapInstanceRef.current.setView([latitude, longitude], 16);
        markerRef.current.setLatLng([latitude, longitude]);
        circleRef.current.setLatLng([latitude, longitude]);
      });
    }
  };

  return (
    <div className="space-y-3 relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search address (e.g. Signature Global Sec 81)..." 
            className="input-field pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[999] max-h-48 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectResult(res)}
                  className="w-full text-left p-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-0 dark:border-gray-700"
                >
                  {res.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          type="button"
          onClick={() => handleSearch()}
          className="btn-primary py-2 px-4 text-xs flex items-center gap-2 whitespace-nowrap"
          disabled={isSearching}
        >
          {isSearching ? '...' : 'Search'}
        </button>
      </div>

      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
      />
      
      <div className="flex justify-between items-center text-[10px] text-gray-500">
        <p className="flex items-center gap-1 italic">
          <Navigation size={10} /> Drag the pin to adjust precisely
        </p>
        <button 
          type="button" 
          onClick={useMyLocation}
          className="text-[#CC0000] font-medium hover:underline flex items-center gap-1"
        >
          <MapPin size={10} /> Use My Location
        </button>
      </div>
    </div>
  );
}
