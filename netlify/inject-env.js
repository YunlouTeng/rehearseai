// Post-build script to inject environment variables into static files
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Output directory
const outputDir = path.resolve(__dirname, '../out');

console.log('Injecting environment variables into static files...');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables for Supabase');
  process.exit(1);
}

// Create a config script to inject into the HTML
const configScript = `
<script>
  window.REHEARSEAI_CONFIG = {
    supabase: {
      url: "${supabaseUrl}",
      anonKey: "${supabaseAnonKey}"
    }
  };
</script>
`;

try {
  // Find all HTML files in the output directory
  const htmlFiles = glob.sync(`${outputDir}/**/*.html`);
  
  if (htmlFiles.length === 0) {
    console.log('⚠️ No HTML files found in the output directory.');
  }
  
  // Inject the config script into each HTML file
  htmlFiles.forEach(file => {
    try {
      let html = fs.readFileSync(file, 'utf8');
      
      // Insert the config script before the closing head tag
      html = html.replace('</head>', `${configScript}</head>`);
      
      // Write the modified HTML back to the file
      fs.writeFileSync(file, html);
      console.log(`✅ Injected config into ${file}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  });

  console.log('✅ Environment variable injection complete.');
} catch (error) {
  console.error('❌ Failed to inject environment variables:', error);
  process.exit(1);
} 