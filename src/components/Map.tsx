import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import { Creature } from '../data/creatures';

const Map = forwardRef(({ zoom, center, creatures }: { zoom: number; center: [number, number]; creatures: Creature[] }, ref) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useImperativeHandle(ref, () => mapContainerRef.current);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      markersRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      mapRef.current.setView(center, zoom);
    }
  }, [zoom, center]);

  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();
    creatures.forEach(creature => {
      const color = creature.alignment === 'Neutral' ? '#94a3b8' : creature.alignment === 'Malicious' ? '#ef4444' : creature.alignment === 'Ambivalent' ? '#eab308' : '#22c55e';
      const icon = L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
      });
      L.marker([creature.lat, creature.lng], { icon }).addTo(markersRef.current!).bindPopup(`<b>${creature.name}</b><br>Category: ${creature.category}<br>Alignment: ${creature.alignment}<br>${creature.lore}`);
    });
  }, [creatures]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
});

Map.displayName = 'Map';

export default Map;
