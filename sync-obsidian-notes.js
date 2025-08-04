// sync-obsidian-notes.js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
const configPath = path.join(__dirname, "sync-config.json");
let SYNC_CONFIG;

try {
  const configFile = fs.readFileSync(configPath, "utf8");
  SYNC_CONFIG = JSON.parse(configFile);
} catch (error) {
  console.error("❌ Error loading sync-config.json:", error.message);
  console.log("Please create a sync-config.json file with your configuration.");
  process.exit(1);
}

// Configurable paths from config
const SRC_DIR = path.resolve(__dirname, SYNC_CONFIG.obsidianPath);
const DEST_DIR = path.resolve(__dirname, SYNC_CONFIG.astroBlogPath);

// Folder names to skip from config
const EXCLUDED_FOLDERS = new Set(SYNC_CONFIG.excludedFolders);

function isMarkdown(file) {
  return file.endsWith(".md");
}

function isPublic(tags) {
  if (!tags) return false;
  return SYNC_CONFIG.publicTags.some(publicTag => 
    tags.some(tag => tag.includes(publicTag))
  );
}

function shouldExclude(dirPath) {
  const parts = dirPath.split(path.sep);
  return parts.some((part) => EXCLUDED_FOLDERS.has(part));
}

function generateSlug(filePath, title) {
  // Default: use filename without extension
  return path.basename(filePath, '.md');
}

function convertObsidianFrontmatter(obsidianData, content, filePath) {
  // Extract title from first heading or use filename
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');
  
  // Convert created date to pubDatetime - keep as Date object
  const pubDatetime = obsidianData.created ? new Date(obsidianData.created) : new Date();
  
  // Convert tags format - remove public tags and clean up
  const tags = obsidianData.tags ? 
    obsidianData.tags
      .filter(tag => !SYNC_CONFIG.publicTags.some(publicTag => tag.includes(publicTag)))
      .map(tag => tag.replace("#", "")) : 
    SYNC_CONFIG.defaultTags;
  
  // Generate description from first paragraph
  let description = SYNC_CONFIG.postProcessing.defaultDescription;
  if (SYNC_CONFIG.postProcessing.generateDescription) {
    const firstParagraph = content.match(/^(?!^#|\s*$)(.+)$/m);
    if (firstParagraph) {
      description = firstParagraph[1].substring(0, SYNC_CONFIG.postProcessing.descriptionMaxLength);
      if (firstParagraph[1].length > SYNC_CONFIG.postProcessing.descriptionMaxLength) {
        description += "...";
      }
    }
  }
  
  // Build Astro frontmatter
  const astroFrontmatter = {
    title,
    description,
    pubDatetime,
    tags,
    author: SYNC_CONFIG.defaultAuthor,
    draft: false,
    featured: false,
    slug: generateSlug(filePath, title)
  };
  
  return astroFrontmatter;
}

function convertToAstroFormat(rawContent, filePath) {
  const parsed = matter(rawContent);
  
  // Convert frontmatter
  const astroFrontmatter = convertObsidianFrontmatter(parsed.data, parsed.content, filePath);
  
  // Remove the first heading if configured to do so
  let content = parsed.content;
  if (SYNC_CONFIG.postProcessing.removeFirstHeading) {
    content = content.replace(/^#\s+.+$/m, '').trim();
  }
  
  // If content is empty after removing title, add a placeholder
  if (!content) {
    content = "This note is currently empty.";
  }
  
  // Reconstruct with Astro frontmatter
  const astroContent = matter.stringify(content, astroFrontmatter);
  
  return astroContent;
}

function walkAndSync(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (shouldExclude(fullPath)) continue;

    if (entry.isDirectory()) {
      walkAndSync(fullPath);
    } else if (entry.isFile() && isMarkdown(entry.name)) {
      const raw = fs.readFileSync(fullPath, "utf8");
      const parsed = matter(raw);

      if (isPublic(parsed.data.tags)) {
        // Just use the filename, no folder structure
        const fileName = path.basename(fullPath);
        const targetPath = path.join(DEST_DIR, fileName);

        // Ensure destination directory exists
        fs.mkdirSync(DEST_DIR, { recursive: true });

        // Convert to Astro format
        const astroContent = convertToAstroFormat(raw, fullPath);
        
        fs.writeFileSync(targetPath, astroContent);
        console.log(`✔ Synced: ${fileName}`);
      } 
    }
  }
}

// Clean destination directory if configured
function cleanDestination() {
  if (SYNC_CONFIG.cleanDestination && fs.existsSync(DEST_DIR)) {
    console.log("🧹 Cleaning destination directory...");
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }
}

// Main execution
console.log(" Starting sync from Obsidian to Astro...");
console.log(`📁 Source: ${SRC_DIR}`);
console.log(`📁 Destination: ${DEST_DIR}`);
console.log(`🚫 Excluded folders: ${SYNC_CONFIG.excludedFolders.join(', ')}`);
console.log(`🏷️  Public tags: ${SYNC_CONFIG.publicTags.join(', ')}`);

// Check if source directory exists
if (!fs.existsSync(SRC_DIR)) {
  console.error(`❌ Error: Source directory not found: ${SRC_DIR}`);
  console.log("Please update the 'obsidianPath' in sync-config.json");
  process.exit(1);
}

cleanDestination();
walkAndSync(SRC_DIR);
console.log("✅ Sync completed!");
