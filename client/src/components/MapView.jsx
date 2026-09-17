import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useParking } from '../context/ParkingContext';
import { MapPin, Navigation, Car, Zap, Accessibility, Compass, ShieldCheck } from 'lucide-react';

// Fix default marker icon issues in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to center map smoothly when location changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

// Generate custom SVG HTML marker icon based on occupancy state
const createCustomMarkerIcon = (location) => {
  const available = location.stats?.available ?? 10;
  const total = location.stats?.total ?? 20;
  const occupancyPct = location.stats?.occupancyPercentage ?? 50;

  let colorClass = '#10b981'; // Green (Available)
  let badgeText = `${available} Available`;
  if (occupancyPct >= 90 || available === 0) {
    colorClass = '#ef4444'; // Red (Full)
    badgeText = 'LOT FULL';
  } else if (occupancyPct >= 65) {
    colorClass = '#f59e0b'; // Yellow (High Occupancy)
  }

  const html = `
    <div style="position: relative; text-align: center;">
      <div style="
        background-color: ${colorClass};
        color: white;
        font-weight: 800;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 2px solid white;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      ">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: white; display: inline-block;"></span>
        ${location.name.split(' ')[0]} (${available})
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent; 
        border-right: 6px solid transparent; 
        border-top: 8px solid ${colorClass}; 
        margin: 0 auto;
      "></div>
    </div>
  `;

  return L.divAnchor ? new L.DivIcon({ html, className: 'custom-map-pin', iconSize: [120, 40], iconAnchor: [60, 40] })
                     : L.divIcon({ html, className: 'custom-map-pin', iconSize: [120, 40], iconAnchor: [60, 40] });
};

export default function MapView({ onSelectLocation }) {
  const { locations, selectedLocation, setSelectedLocation, openModal } = useParking();

  const centerCoords = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [37.7850, -122.4065];

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950">
      <MapContainer
        center={centerCoords}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={centerCoords} />

        {locations.map((loc) => {
          const isSelected = selectedLocation && String(selectedLocation._id) === String(loc._id);
          return (
            <Marker
              key={loc._id}
              position={[loc.lat, loc.lng]}
              icon={createCustomMarkerIcon(loc)}
              eventHandlers={{
                click: () => {
                  setSelectedLocation(loc);
                  if (onSelectLocation) onSelectLocation(loc);
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 max-w-xs text-slate-900">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-extrabold text-sm text-slate-900">{loc.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (loc.stats?.available ?? 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {(loc.stats?.available ?? 0) > 0 ? `${loc.stats?.available} Free Slots` : 'LOT FULL'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600 inline" /> {loc.address}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-2 rounded-lg text-[11px] mb-3 font-medium">
                    <div className="flex items-center gap-1"><Car className="w-3 h-3 text-blue-600" /> 4-Wheeler: <b>{loc.stats?.breakdown?.fourWheeler ?? 0}</b></div>
                    <div className="flex items-center gap-1"><Car className="w-3 h-3 text-emerald-600" /> 2-Wheeler: <b>{loc.stats?.breakdown?.twoWheeler ?? 0}</b></div>
                    <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> EV Slots: <b>{loc.stats?.breakdown?.ev ?? 0}</b></div>
                    <div className="flex items-center gap-1"><Accessibility className="w-3 h-3 text-purple-600" /> Handicap: <b>{loc.stats?.breakdown?.handicap ?? 0}</b></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedLocation(loc);
                        openModal('reservation', { location: loc });
                      }}
                      disabled={(loc.stats?.available ?? 0) === 0}
                      className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow transition-colors text-center"
                    >
                      Pre-Book Slot
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
                      title="Get Directions"
                    >
                      <Navigation className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 glass-card p-3 rounded-xl border border-slate-700/80 shadow-lg text-xs space-y-1.5 text-slate-200">
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-blue-400" /> Live Availability Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span>Available (&gt;35% free)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
          <span>High Occupancy (&gt;65% full)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
          <span>Lot Full (100% occupied)</span>
        </div>
      </div>
    </div>
  );
}
