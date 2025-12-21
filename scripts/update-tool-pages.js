import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '../src/pages');

// New navigation HTML
const newNav = `<nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center h-16">
                <div class="flex-shrink-0 flex items-center cursor-pointer" id="home-logo">
                    <img src="/images/favicon.svg" alt="Bento PDF Logo" class="h-8 w-8" />
                    <span class="text-gray-900 dark:text-white font-bold text-xl ml-2">
                        <a href="/">BentoPDF</a>
                    </span>
                </div>

                <!-- Theme Toggle & Language Switcher -->
                <div class="flex items-center gap-2">
                    <!-- Dark Mode Toggle -->
                    <button id="theme-toggle" class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Toggle theme">
                        <i data-lucide="sun" class="w-5 h-5 hidden" id="theme-light-icon"></i>
                        <i data-lucide="moon" class="w-5 h-5" id="theme-dark-icon"></i>
                    </button>
                    
                    <!-- Language Switcher -->
                    <div class="relative" id="language-dropdown">
                        <button id="language-btn" class="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <i data-lucide="globe" class="w-5 h-5"></i>
                            <span id="current-language" class="text-sm font-medium hidden sm:inline">English</span>
                            <i data-lucide="chevron-down" class="w-4 h-4"></i>
                        </button>
                        <div id="language-menu" class="hidden absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                            <a href="/en/" class="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-t-lg" data-lang="en">English</a>
                            <a href="/de/" class="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white" data-lang="de">Deutsch</a>
                            <a href="/zh/" class="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white" data-lang="zh">中文</a>
                            <a href="/vi/" class="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-b-lg" data-lang="vi">Tiếng Việt</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>`;

// Theme script to add before </body>
const themeScript = `
  <script type="module">
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-light-icon');
    const darkIcon = document.getElementById('theme-dark-icon');
    const html = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    function updateTheme(dark) {
      if (dark) {
        html.classList.add('dark');
        lightIcon?.classList.remove('hidden');
        darkIcon?.classList.add('hidden');
      } else {
        html.classList.remove('dark');
        lightIcon?.classList.add('hidden');
        darkIcon?.classList.remove('hidden');
      }
    }
    
    updateTheme(isDark);
    
    themeToggle?.addEventListener('click', () => {
      const isDarkNow = html.classList.contains('dark');
      localStorage.setItem('theme', isDarkNow ? 'light' : 'dark');
      updateTheme(!isDarkNow);
    });

    // Language dropdown toggle
    const languageBtn = document.getElementById('language-btn');
    const languageMenu = document.getElementById('language-menu');
    const currentLanguage = document.getElementById('current-language');
    
    const path = window.location.pathname;
    const langMatch = path.match(/^\\/(en|de|zh|vi)(?:\\/|$)/);
    const langNames = { en: 'English', de: 'Deutsch', zh: '中文', vi: 'Tiếng Việt' };
    
    let detectedLang = 'en';
    if (langMatch) {
      detectedLang = langMatch[1];
    } else {
      const storedLang = localStorage.getItem('i18nextLng');
      if (storedLang && langNames[storedLang]) {
        detectedLang = storedLang;
      } else {
        const browserLang = navigator.language.split('-')[0];
        if (langNames[browserLang]) {
          detectedLang = browserLang;
        }
      }
    }
    if (currentLanguage) {
      currentLanguage.textContent = langNames[detectedLang] || 'English';
    }
    
    if (languageBtn && languageMenu) {
      languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        languageMenu.classList.toggle('hidden');
      });
      
      document.addEventListener('click', () => {
        languageMenu.classList.add('hidden');
      });
    }
  </script>
</body>`;

// Theme init script for <head> to prevent flash
const themeInitScript = `<script>
    (function() {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>`;

// Process each HTML file
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add theme init script in <head> to prevent flash
    if (!content.includes("(function() {")) {
        content = content.replace(
            /(<link href="\/src\/css\/styles\.css")/,
            `${themeInitScript}\n    $1`
        );
    }
    
    // Replace body class
    content = content.replace(
        /<body class="antialiased bg-gray-900">/g,
        '<body class="antialiased">'
    );
    
    // Replace nav section
    content = content.replace(
        /<nav class="bg-gray-800[\s\S]*?<\/nav>/,
        newNav
    );
    
    // Update uploader div background
    content = content.replace(
        /id="uploader" class="min-h-screen flex flex-col items-center justify-start py-12 p-4 bg-gray-900"/g,
        'id="uploader" class="min-h-screen flex flex-col items-center justify-start py-12 p-4"'
    );
    
    // Update tool-uploader div
    content = content.replace(
        /id="tool-uploader"[\s\S]*?class="bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full text-gray-200 border border-gray-700"/g,
        'id="tool-uploader"\n            class="bg-white dark:bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"'
    );
    
    // Update h1 title
    content = content.replace(
        /class="text-2xl font-bold text-white mb-2"/g,
        'class="text-2xl font-bold text-gray-900 dark:text-white mb-2"'
    );
    
    // Update subtitle
    content = content.replace(
        /class="text-gray-400 mb-6"/g,
        'class="text-gray-500 dark:text-gray-400 mb-6"'
    );
    
    // Update drop-zone
    content = content.replace(
        /id="drop-zone"[\s\S]*?class="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700/g,
        'id="drop-zone"\n                class="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
    );
    
    // Remove footer
    content = content.replace(/<footer[\s\S]*?<\/footer>/g, '');
    
    // Add theme script before </body>
    if (!content.includes('function updateTheme')) {
        content = content.replace(
            /<\/body>/,
            themeScript
        );
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
});

console.log(`\nDone! Updated ${files.length} files.`);
