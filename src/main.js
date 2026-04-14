import L from 'leaflet'
import Papa from 'papaparse'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Initialize map
const map = L.map('map').setView([54.5260, 15.2551], 4)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map)

let creatures = []
let markers = {}
let selectedMarker = null
let markerLayer = L.layerGroup()

// Add marker layer to map immediately
markerLayer.addTo(map)

// Color mappings
const alignmentColors = {
  'Benevolent': '#10b981',
  'Malicious': '#ef4444',
  'Ambivalent': '#f59e0b',
  'Neutral': '#64748b',
}

const categoryColors = {
  'Dragons': '#ef4444',
  'Anthromorphic': '#8b5cf6',
  'Zoomorphic': '#10b981',
  'Hybrids of human and animal': '#f59e0b',
  'Hybrid animals': '#3b82f6',
}

// Icon file mapping
const categoryIcons = {
  'Dragons': 'dragon.png',
  'Zoomorphic': 'bear.png',
  'Hybrids of human and animal': 'minotaur.png',
  'Hybrid animals': 'chimera.png',
  'Anthromorphic': 'cyclops.png',
}

// Generate HTML circle icon with category background and alignment border
function getCreatureIconHtml(category, alignment, size = 24) {
  const bgColor = categoryColors[category] || '#8b5cf6'
  const borderColor = alignmentColors[alignment] || '#64748b'
  const iconFile = categoryIcons[category] || 'cyclops.png'
  const iconSize = Math.floor(size * 0.7)

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${bgColor};
      border: 2px solid ${borderColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      overflow: hidden;
    ">
      <img src="/assets/map-icons/${iconFile}" style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain;" alt="${category}">
    </div>
  `
  return html
}

// Create custom icon for a creature
function getCreatureIcon(category, alignment) {
  const html = getCreatureIconHtml(category, alignment)
  return L.divIcon({
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
    className: 'creature-marker-icon',
  })
}

// DOM elements
const searchInput = document.getElementById('search-input')
const creaturesList = document.getElementById('creatures-list')
const totalCount = document.getElementById('total-count')
const shownCount = document.getElementById('shown-count')

// Load CSV data
async function loadCreatures() {
  try {
    const response = await fetch('/data/creatures.csv')
    const csv = await response.text()

    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        creatures = results.data.filter(row => row.Name && row.Lat && row.Lon)
        creatures = creatures.map(c => ({
          ...c,
          latitude: parseFloat(c.Lat),
          longitude: parseFloat(c.Lon),
        }))

        totalCount.textContent = creatures.length
        addMarkersToMap()
        renderCreaturesList()
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        creaturesList.innerHTML = '<div class="loading">Error loading creatures data</div>'
      }
    })
  } catch (error) {
    console.error('Error loading CSV:', error)
    creaturesList.innerHTML = '<div class="loading">Error loading creatures data</div>'
  }
}

// Add markers to map
function addMarkersToMap(filtered = creatures) {
  markerLayer.clearLayers()
  markers = {}

  filtered.forEach(creature => {
    const marker = L.marker([creature.latitude, creature.longitude], {
      icon: getCreatureIcon(creature.Category, creature.Alignment)
    })
      .bindPopup(`
        <div style="font-weight: bold; margin-bottom: 5px;">${creature.Name}</div>
        <div style="font-size: 12px; color: #666;">
          <div><strong>Category:</strong> ${creature.Category || 'N/A'}</div>
          <div><strong>Alignment:</strong> ${creature.Alignment || 'N/A'}</div>
          ${creature.Lore ? `<div style="margin-top: 5px; font-size: 11px;">${creature.Lore.substring(0, 100)}...</div>` : ''}
        </div>
      `)
      .on('click', () => selectCreature(creature))
      .addTo(markerLayer)

    markers[creature.Name] = marker
  })
}

// Render creatures list
function renderCreaturesList(filtered = creatures) {
  if (filtered.length === 0) {
    creaturesList.innerHTML = '<div class="loading">No creatures found</div>'
    return
  }

  shownCount.textContent = filtered.length
  creaturesList.innerHTML = filtered
    .map(creature => `
      <div class="creature-item ${selectedMarker === creature.Name ? 'active' : ''}" 
           onclick="window.selectCreature(${JSON.stringify(creature).replace(/"/g, '&quot;')})">
        <div class="creature-item-name">${creature.Name}</div>
        <div class="creature-item-meta">${creature.Category || 'Unknown'} • ${creature.Alignment || 'Neutral'}</div>
      </div>
    `)
    .join('')
}

// Select creature
window.selectCreature = function(creature) {
  selectedMarker = creature.Name
  markers[creature.Name]?.openPopup()
  map.setView([creature.latitude, creature.longitude], 8)
  renderCreaturesList()
}

// Search functionality
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase()
  const filtered = creatures.filter(c =>
    c.Name.toLowerCase().includes(query) ||
    (c.Category && c.Category.toLowerCase().includes(query)) ||
    (c.Alignment && c.Alignment.toLowerCase().includes(query)) ||
    (c.Lore && c.Lore.toLowerCase().includes(query))
  )
  addMarkersToMap(filtered)
  renderCreaturesList(filtered)
})

// Load creatures on page load
loadCreatures()
