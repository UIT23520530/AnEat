"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Spin } from "antd";

// Dynamic import để tránh SSR issues với Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface Location {
  lat: number;
  lng: number;
  name: string;
  type: "from" | "to" | "current";
}

interface ShipmentMapProps {
  fromLocation?: string;
  toLocation?: string;
  shipmentNumber?: string;
  status?: string;
}

// Hàm geocode đơn giản - mock data dựa trên địa chỉ
// Trong thực tế, bạn sẽ dùng Nominatim API hoặc Google Geocoding API
const geocodeAddress = (address: string): { lat: number; lng: number } => {
  // Danh sách các địa điểm phổ biến ở TP.HCM
  const locationMap: Record<string, { lat: number; lng: number }> = {
    // Quận 1
    "quận 1": { lat: 10.7769, lng: 106.7009 },
    "nguyễn huệ": { lat: 10.7736, lng: 106.7032 },
    "lê lợi": { lat: 10.7725, lng: 106.6989 },
    "đồng khởi": { lat: 10.7776, lng: 106.7013 },
    // Quận 3
    "quận 3": { lat: 10.7834, lng: 106.6867 },
    "võ văn tần": { lat: 10.7845, lng: 106.6891 },
    // Quận 7
    "quận 7": { lat: 10.7340, lng: 106.7218 },
    "phú mỹ hưng": { lat: 10.7285, lng: 106.7184 },
    "nguyễn văn linh": { lat: 10.7312, lng: 106.7156 },
    // Quận Bình Thạnh
    "bình thạnh": { lat: 10.8108, lng: 106.7094 },
    "điện biên phủ": { lat: 10.8012, lng: 106.7123 },
    // Quận Tân Bình
    "tân bình": { lat: 10.8018, lng: 106.6528 },
    "cộng hòa": { lat: 10.7967, lng: 106.6543 },
    // Thủ Đức
    "thủ đức": { lat: 10.8531, lng: 106.7569 },
    // Kho hàng mặc định
    "kho trung tâm": { lat: 10.7800, lng: 106.6950 },
    "kho": { lat: 10.7800, lng: 106.6950 },
    "warehouse": { lat: 10.7800, lng: 106.6950 },
  };

  const lowerAddress = address.toLowerCase();
  
  // Tìm kiếm trong map
  for (const [key, coords] of Object.entries(locationMap)) {
    if (lowerAddress.includes(key)) {
      // Thêm một chút random để các marker không chồng lên nhau
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.01,
        lng: coords.lng + (Math.random() - 0.5) * 0.01,
      };
    }
  }

  // Mặc định trả về vị trí trung tâm TP.HCM với random offset
  return {
    lat: 10.7769 + (Math.random() - 0.5) * 0.05,
    lng: 106.7009 + (Math.random() - 0.5) * 0.05,
  };
};

export default function ShipmentMap({
  fromLocation,
  toLocation,
  shipmentNumber,
  status,
}: ShipmentMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [center, setCenter] = useState<[number, number]>([10.7769, 106.7009]); // TP.HCM

  useEffect(() => {
    setIsClient(true);
    
    // Import Leaflet CSS
    import("leaflet/dist/leaflet.css");
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const newLocations: Location[] = [];

    if (fromLocation) {
      const fromCoords = geocodeAddress(fromLocation);
      newLocations.push({
        ...fromCoords,
        name: fromLocation,
        type: "from",
      });
    }

    if (toLocation) {
      const toCoords = geocodeAddress(toLocation);
      newLocations.push({
        ...toCoords,
        name: toLocation,
        type: "to",
      });
    }

    // Thêm vị trí hiện tại (giả lập) nếu đang giao
    if (status === "IN_TRANSIT" && newLocations.length === 2) {
      const midLat = (newLocations[0].lat + newLocations[1].lat) / 2;
      const midLng = (newLocations[0].lng + newLocations[1].lng) / 2;
      newLocations.push({
        lat: midLat + (Math.random() - 0.5) * 0.01,
        lng: midLng + (Math.random() - 0.5) * 0.01,
        name: "Vị trí hiện tại",
        type: "current",
      });
    }

    setLocations(newLocations);

    // Tính center dựa trên các locations
    if (newLocations.length > 0) {
      const avgLat = newLocations.reduce((sum, loc) => sum + loc.lat, 0) / newLocations.length;
      const avgLng = newLocations.reduce((sum, loc) => sum + loc.lng, 0) / newLocations.length;
      setCenter([avgLat, avgLng]);
    }
  }, [fromLocation, toLocation, status, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Spin>
          <div className="p-8 text-gray-500">Đang tải bản đồ...</div>
        </Spin>
      </div>
    );
  }

  // Custom icon cho markers
  const createIcon = (type: "from" | "to" | "current") => {
    if (typeof window === "undefined") return undefined;
    
    const L = require("leaflet");
    
    const colors = {
      from: "#3b82f6", // blue
      to: "#ef4444",   // red  
      current: "#22c55e", // green
    };

    const labels = {
      from: "A",
      to: "B",
      current: "C",
    };

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${colors[type]};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">${labels[type]}</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Tạo polyline path
  const routePath = locations
    .filter((loc) => loc.type === "from" || loc.type === "to")
    .map((loc) => [loc.lat, loc.lng] as [number, number]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Vẽ đường đi */}
        {routePath.length >= 2 && (
          <Polyline
            positions={routePath}
            color="#ff6600"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        {/* Markers */}
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            icon={createIcon(location.type)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">
                  {location.type === "from" && "Điểm xuất phát"}
                  {location.type === "to" && "Điểm đến"}
                  {location.type === "current" && "Vị trí hiện tại"}
                </div>
                <div className="text-gray-600">{location.name}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-xs font-semibold mb-2 text-gray-700">Chú thích</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
            <span className="text-xs text-gray-600">Điểm xuất phát (Kho)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" />
            <span className="text-xs text-gray-600">Điểm đến</span>
          </div>
          {status === "IN_TRANSIT" && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow" />
              <span className="text-xs text-gray-600">Vị trí shipper</span>
            </div>
          )}
        </div>
        {shipmentNumber && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Đơn: </span>
            <span className="text-xs font-mono font-semibold">#{shipmentNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
