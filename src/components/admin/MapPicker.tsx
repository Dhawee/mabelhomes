"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPickerProps {
  lat: number;
  lng: number;
  address: string;
  onChange: (data: { lat: number; lng: number; address: string; state?: string; country?: string }) => void;
}

export default function MapPicker({ lat, lng, address, onChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const startLat = lat || 6.45;
    const startLng = lng || 3.5;

    const map = L.map(mapContainerRef.current).setView([startLat, startLng], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", async () => {
      const position = marker.getLatLng();
      const res = await reverseGeocode(position.lat, position.lng);
      onChange({ lat: position.lat, lng: position.lng, address: res.address, state: res.state, country: res.country });
    });

    map.on("click", async (e: any) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      const res = await reverseGeocode(clickLat, clickLng);
      onChange({ lat: clickLat, lng: clickLng, address: res.address, state: res.state, country: res.country });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current && lat && lng) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== lat || currentPos.lng !== lng) {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng]);
      }
    }
  }, [lat, lng]);

  const reverseGeocode = async (latitude: number, longitude: number): Promise<{ address: string; state: string; country: string }> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      if (res.ok) {
        const data = await res.json();
        const addressData = data.address || {};
        return {
          address: data.display_name || address,
          state: addressData.state || addressData.region || addressData.county || "",
          country: addressData.country || "",
        };
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
    return { address: address, state: "", country: "" };
  };

  const handleSearch = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!searchQuery.trim()) return;
    setGeocoding(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const result = data[0];
          const newLat = parseFloat(result.lat);
          const newLng = parseFloat(result.lon);

          if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
            mapRef.current.setView([newLat, newLng], 14);
          }
          const reverseRes = await reverseGeocode(newLat, newLng);
          onChange({
            lat: newLat,
            lng: newLng,
            address: reverseRes.address || result.display_name,
            state: reverseRes.state,
            country: reverseRes.country
          });
        } else {
          alert("Address not found. Please try a different search query.");
        }
      }
    } catch (err) {
      console.error("Geocoding search error:", err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([currentLat, currentLng]);
          mapRef.current.setView([currentLat, currentLng], 15);
        }
        const res = await reverseGeocode(currentLat, currentLng);
        onChange({ lat: currentLat, lng: currentLng, address: res.address, state: res.state, country: res.country });
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to retrieve current location. Please check your browser permissions.");
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSearch(e);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 flex gap-2 min-w-[260px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search address (e.g. Lekki Phase 1, Lagos)..."
            className="form-input flex-1"
          />
          <button
            type="button"
            onClick={(e) => handleSearch(e)}
            disabled={geocoding}
            className="btn btn-outline py-2 text-sm shrink-0"
          >
            {geocoding ? "Searching..." : "Search"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="btn btn-gold py-2 text-sm shrink-0 gap-1.5"
        >
          📍 Use Current Location
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-10"
      />
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>Click on the map or drag the marker to adjust coordinates.</span>
        <span>Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</span>
      </div>
    </div>
  );
}
