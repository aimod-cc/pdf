import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const languages = ['en', 'de', 'zh', 'vi'];

// HTML files to copy to language folders
const htmlFiles = [
    'index.html',
    'about.html',
    'contact.html',
    'faq.html',
    'privacy.html',
    'terms.html',
    'licensing.html',
];

// Get all HTML files from dist (including tool pages)
function getAllHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && item.endsWith('.html')) {
            files.push(item);
        }
    }
    
    return files;
}

// Update HTML content for language-specific version
function updateHtmlForLanguage(content, lang) {
    // Update html lang attribute
    content = content.replace(/<html lang="en"/, `<html lang="${lang}"`);
    
    // Update canonical and alternate links if needed
    // The i18n system will handle the actual translations
    
    return content;
}

// Main function
function generateLangFolders() {
    console.log('Generating language folders...\n');
    
    // Check if dist exists
    if (!fs.existsSync(distDir)) {
        console.error('Error: dist folder not found. Run "npm run build" first.');
        process.exit(1);
    }
    
    // Get all HTML files
    const allHtmlFiles = getAllHtmlFiles(distDir);
    console.log(`Found ${allHtmlFiles.length} HTML files to process.\n`);
    
    // Create language folders and copy files
    for (const lang of languages) {
        const langDir = path.join(distDir, lang);
        
        // Create language directory
        if (!fs.existsSync(langDir)) {
            fs.mkdirSync(langDir, { recursive: true });
        }
        
        console.log(`Processing language: ${lang}`);
        
        // Copy all HTML files to language folder
        for (const htmlFile of allHtmlFiles) {
            const srcPath = path.join(distDir, htmlFile);
            const destPath = path.join(langDir, htmlFile);
            
            // Read and update content
            let content = fs.readFileSync(srcPath, 'utf8');
            content = updateHtmlForLanguage(content, lang);
            
            // Write to language folder
            fs.writeFileSync(destPath, content, 'utf8');
        }
        
        console.log(`  - Copied ${allHtmlFiles.length} files to /${lang}/\n`);
    }
    
    console.log('Language folders generated successfully!');
    console.log(`\nStructure:`);
    for (const lang of languages) {
        console.log(`  dist/${lang}/ - ${allHtmlFiles.length} HTML files`);
    }
}

generateLangFolders();
