// Post-build script to inject environment variables into static files
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Output directory
const outputDir = path.resolve(__dirname, '../out');

console.log('Injecting environment variables into static files...');
console.log(`Output directory: ${outputDir}`);

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

console.log(`✅ Found SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`✅ Found SUPABASE_ANON_KEY: ${supabaseAnonKey ? '[key available]' : '[key missing]'}`);

// Create a config script to inject into the HTML
const configScript = `
<script type="text/javascript">
  window.REHEARSEAI_CONFIG = {
    supabase: {
      url: "${supabaseUrl}",
      anonKey: "${supabaseAnonKey}"
    }
  };
  console.log('RehearseAI config loaded', { url: window.REHEARSEAI_CONFIG.supabase.url, keyAvailable: !!window.REHEARSEAI_CONFIG.supabase.anonKey });
</script>
`;

try {
  if (!fs.existsSync(outputDir)) {
    console.error(`❌ Output directory does not exist: ${outputDir}`);
    process.exit(1);
  }
  
  // Find all HTML files in the output directory
  const htmlFiles = glob.sync(`${outputDir}/**/*.html`);
  
  console.log(`Found ${htmlFiles.length} HTML files to process`);
  
  if (htmlFiles.length === 0) {
    console.warn('⚠️ No HTML files found in the output directory.');
    
    // List what is in the output directory for debugging
    const files = glob.sync(`${outputDir}/**/*`);
    console.log('Files in output directory:');
    files.forEach((file) => {
      console.log(`- ${path.relative(outputDir, file)}`);
    });
  }
  
  // Inject the config script into each HTML file
  let processedCount = 0;
  htmlFiles.forEach(file => {
    try {
      let html = fs.readFileSync(file, 'utf8');
      
      // Check if config is already injected
      if (html.includes('window.REHEARSEAI_CONFIG')) {
        console.log(`⚠️ Config already exists in ${file}, skipping`);
        return;
      }
      
      // Insert the config script before the closing head tag
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${configScript}</head>`);
      } else {
        console.warn(`⚠️ No </head> tag found in ${file}, adding at beginning`);
        html = `${configScript}${html}`;
      }
      
      // Write the modified HTML back to the file
      fs.writeFileSync(file, html);
      processedCount++;
      console.log(`✅ Injected config into ${file}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  });

  console.log(`✅ Processed ${processedCount}/${htmlFiles.length} HTML files successfully.`);
  console.log('✅ Environment variable injection complete.');
} catch (error) {
  console.error('❌ Failed to inject environment variables:', error);
  process.exit(1);
} 