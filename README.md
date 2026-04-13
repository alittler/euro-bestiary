<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# European Mythical Creatures Map

An open dataset of European (and classical Mediterranean) mythical creatures, with approximate geographic coordinates, provided in GeoJSON and CSV formats, along with an interactive Leaflet map preview.

---

## Dataset

### What is it?

A collection of 126 mythical creatures drawn from European and classical folklore and mythology, each placed at an approximate representative geographic location corresponding to the cultural region they originate from.

> **Note:** Coordinates are **approximate/representative** — they indicate the cultural region of origin, not a specific documented location.

### Files

| File | Description |
|------|-------------|
| [`data/creatures.geojson`](data/creatures.geojson) | GeoJSON FeatureCollection — ready for use with Leaflet, Mapbox GL JS, OpenLayers, etc. |
| [`data/creatures.csv`](data/creatures.csv) | Tabular export for spreadsheets and data tools |
| [`preview/index.html`](preview/index.html) | Interactive Leaflet + OpenStreetMap preview |

---

## Data Formats & Field Definitions

### GeoJSON (`data/creatures.geojson`)

Valid `FeatureCollection` following the [GeoJSON spec (RFC 7946)](https://tools.ietf.org/html/rfc7946).  
Geometry is `Point` with coordinates in **`[longitude, latitude]`** order.

Each feature's `properties` object contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique numeric identifier |
| `name` | string | Name of the creature |
| `category` | string | Taxonomic category (e.g. `Anthropomorphic`, `Zoomorphic`, `Dragons & Serpentine`, `Spirits`) |
| `alignment` | string | Disposition: `Benevolent`, `Neutral`, `Ambivalent`, or `Malicious` |
| `lore` | string | Brief description of the creature's mythology |
| `source` | string | Citation URL for the underlying research |

### CSV (`data/creatures.csv`)

Columns: `id, name, category, alignment, lat, lon, lore, source`

---

## Using the GeoJSON with Leaflet

```html
<!-- In your HTML -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<div id="map" style="height:600px"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map').setView([52, 14], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  fetch('https://raw.githubusercontent.com/alittler/map/main/data/creatures.geojson')
    .then(r => r.json())
    .then(data => {
      L.geoJSON(data, {
        onEachFeature: function(feature, layer) {
          var p = feature.properties;
          layer.bindPopup('<b>' + p.name + '</b><br>' + p.category + ' | ' + p.alignment + '<br><i>' + p.lore + '</i>');
        }
      }).addTo(map);
    });
</script>
```

---

## Data Credit & Citation

The data compiled here is based on research from:

> Sabban, D. (2013). *The Diversity of European Mythical Creatures*. **Folklore**, 124(3), 317–338.  
> [https://www.tandfonline.com/doi/full/10.1080/17445647.2013.867544](https://www.tandfonline.com/doi/full/10.1080/17445647.2013.867544?scroll=top&needAccess=true#d1e129)

If you use or remix this dataset, please credit the original authors and the above publication.

---

## Running the App Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set `GEMINI_API_KEY` in `.env.local`
3. Run: `npm run dev`
