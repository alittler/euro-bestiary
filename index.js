import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const csvPath = join(__dirname, 'public', 'data', 'creatures.csv');
const csvContent = readFileSync(csvPath, 'utf-8');

// Parse CSV with Papa Parse
const { data } = Papa.parse(csvContent, {
  header: true,
  dynamicTyping: false,
  skipEmptyLines: true
});

// Convert to proper data types
const creatures = data.map(creature => ({
  id: parseInt(creature.ID, 10),
  name: creature.Name,
  category: creature.Category,
  alignment: creature.Alignment,
  lat: parseFloat(creature.Lat),
  lon: parseFloat(creature.Lon),
  lore: creature.Lore
}));

export default creatures;
export { creatures };
