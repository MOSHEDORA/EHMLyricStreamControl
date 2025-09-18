
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_API_BASE = 'https://api.github.com/repos/Beblia/Holy-Bible-XML-Format/contents';
const BIBLES_DIR = path.join(__dirname, '..', 'bibles');

// Default Bibles to download
const DEFAULT_BIBLES = [
  'TeluguBible.xml',
  'EnglishKJVBible.xml',
  'EnglishESVBible.xml'
];

// Create bibles directory if it doesn't exist
if (!fs.existsSync(BIBLES_DIR)) {
  fs.mkdirSync(BIBLES_DIR, { recursive: true });
}

async function downloadFile(url, filePath) {
  try {
    console.log(`Downloading: ${path.basename(filePath)}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.text();
    fs.writeFileSync(filePath, data, 'utf8');
    console.log(`✓ Downloaded: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`✗ Error downloading ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function getAvailableBibles() {
  try {
    console.log('Fetching available Bible versions...');
    const response = await fetch(GITHUB_API_BASE);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const contents = await response.json();
    
    // Filter for XML files that look like Bible files
    const xmlFiles = contents.filter(item => 
      item.type === 'file' && 
      item.name.endsWith('.xml') &&
      (item.name.toLowerCase().includes('bible') || item.name.toLowerCase().includes('testament'))
    );
    
    return xmlFiles.map(file => ({
      name: file.name,
      downloadUrl: file.download_url,
      size: file.size
    }));
  } catch (error) {
    console.error('Error fetching Bible list:', error);
    return [];
  }
}

async function downloadDefaultBibles() {
  console.log('Downloading default Bible versions...');
  const availableBibles = await getAvailableBibles();
  
  for (const defaultBible of DEFAULT_BIBLES) {
    const bible = availableBibles.find(b => b.name === defaultBible);
    if (bible) {
      const filePath = path.join(BIBLES_DIR, bible.name);
      await downloadFile(bible.downloadUrl, filePath);
    } else {
      console.log(`⚠ Default Bible not found: ${defaultBible}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

async function downloadSpecificBibles(bibleNames) {
  console.log(`Downloading specific Bible versions: ${bibleNames.join(', ')}`);
  const availableBibles = await getAvailableBibles();
  
  for (const bibleName of bibleNames) {
    const bible = availableBibles.find(b => b.name === bibleName);
    if (bible) {
      const filePath = path.join(BIBLES_DIR, bible.name);
      await downloadFile(bible.downloadUrl, filePath);
    } else {
      console.log(`⚠ Bible not found: ${bibleName}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Export functions for use in other modules
export { getAvailableBibles, downloadDefaultBibles, downloadSpecificBibles };

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Download specific Bibles if provided as arguments
    downloadSpecificBibles(args);
  } else {
    // Download defaults
    downloadDefaultBibles();
  }
}
