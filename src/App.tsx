/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import Map from './components/Map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { creatures } from './data/creatures';

export default function App() {
  const [zoom, setZoom] = useState(2);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const mapRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<'category' | 'alignment'>('category');
  const sortedCreatures = [...creatures].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));

  const categoryCounts = creatures.reduce((acc, creature) => {
    acc[creature.category] = (acc[creature.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alignmentCounts = creatures.reduce((acc, creature) => {
    acc[creature.alignment] = (acc[creature.alignment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = async () => {
    if (mapRef.current) {
      const canvas = await html2canvas(mapRef.current);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'map.png';
      link.click();
    }
  };

  return (
    <div className="flex h-screen w-full p-4 gap-4">
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle>Map Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Total Creatures: {creatures.length}</Label>
          </div>
          <div className="space-y-2">
            <Label>Category Counts</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat} className="bg-gray-100 p-2 rounded">{cat}: {count}</div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Alignment Counts</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(alignmentCounts).map(([align, count]) => (
                <div key={align} className="bg-gray-100 p-2 rounded">{align}: {count}</div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort By</Label>
            <select
              id="sort"
              className="w-full border p-2 rounded"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'category' | 'alignment')}
            >
              <option value="category">Category</option>
              <option value="alignment">Alignment</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zoom">Zoom Level</Label>
            <Input
              id="zoom"
              type="number"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              value={center[0]}
              onChange={(e) => setCenter([Number(e.target.value), center[1]])}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              value={center[1]}
              onChange={(e) => setCenter([center[0], Number(e.target.value)])}
            />
          </div>
          <Button onClick={handleExport} className="w-full">Export Map</Button>
        </CardContent>
      </Card>
      <div className="flex-1 rounded-lg overflow-hidden border">
        <Map ref={mapRef} zoom={zoom} center={center} creatures={sortedCreatures} />
      </div>
    </div>
  );
}
