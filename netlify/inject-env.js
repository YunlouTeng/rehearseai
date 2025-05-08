// Netlify build plugin to inject environment variables into static files
module.exports = {
  onPostBuild: ({ utils, constants }) => {
    // Path to the generated HTML files
    const htmlFolder = constants.PUBLISH_DIR;
    
    console.log('Injecting environment variables into static files...');
    
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      utils.build.failBuild('Missing required environment variables for Supabase');
      return;
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

    // Find all HTML files in the output directory
    const htmlFiles = utils.glob.sync(`${htmlFolder}/**/*.html`);
    
    // Inject the config script into each HTML file
    htmlFiles.forEach(file => {
      try {
        const fs = require('fs');
        let html = fs.readFileSync(file, 'utf8');
        
        // Insert the config script before the closing head tag
        html = html.replace('</head>', `${configScript}</head>`);
        
        // Write the modified HTML back to the file
        fs.writeFileSync(file, html);
        console.log(`Injected config into ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    });

    console.log('Environment variable injection complete.');
  }
}; 