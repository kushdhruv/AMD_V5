
/**
 * Takes generated vanilla HTML, CSS, and JS and bundles it into a single
 * self-contained HTML file for iframe preview.
 */
export function bundleForPreview(frontendFiles) {
  // Extract key files
  const htmlContent = frontendFiles["frontend/index.html"] || frontendFiles["index.html"] || "";
  const cssContent = frontendFiles["frontend/style.css"] || frontendFiles["style.css"] || "";
  const jsContent = frontendFiles["frontend/main.js"] || frontendFiles["main.js"] || "";

  let finalHTML = htmlContent;

  // Ensure meta charset and viewport exist for proper rendering
  if (!finalHTML.includes('<meta charset')) {
    finalHTML = finalHTML.replace('<head>', '<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  }

  // Replace external CSS link with inline style tag
  if (cssContent && finalHTML.includes('<link rel="stylesheet" href="style.css">')) {
    finalHTML = finalHTML.replace(
      '<link rel="stylesheet" href="style.css">',
      `<style>\n${cssContent}\n</style>`
    );
  } else if (cssContent && finalHTML.includes("style.css")) {
    finalHTML = finalHTML.replace(/\<link[^>]*style\.css[^>]*\>/gi, `<style>\n${cssContent}\n</style>`);
  } else if (cssContent && !finalHTML.includes(cssContent)) {
    finalHTML = finalHTML.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
  }

  // Replace external script with inline script tag
  if (jsContent && finalHTML.includes('<script src="main.js"></script>')) {
    finalHTML = finalHTML.replace(
      '<script src="main.js"></script>',
      `<script>\n${jsContent}\n</script>`
    );
  } else if (jsContent && finalHTML.includes("main.js")) {
    finalHTML = finalHTML.replace(/\<script[^>]*main\.js[^>]*\>\<\/script\>/gi, `<script>\n${jsContent}\n</script>`);
  } else if (jsContent && !finalHTML.includes(jsContent)) {
    finalHTML = finalHTML.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
  }

  // DO NOT inject Tailwind CDN — our generated CSS is vanilla and Tailwind
  // overrides base styles (margins, padding, box-sizing) causing visual glitches

  // Add anti-FOUC (Flash of Unstyled Content) to prevent glitching on load
  if (!finalHTML.includes('anti-fouc')) {
    const antiFOUC = `<style id="anti-fouc">
      html { opacity: 0; transition: opacity 0.15s ease-in; }
      html.loaded { opacity: 1; }
    </style>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        document.documentElement.classList.add('loaded');
      });
      // Fallback: show after 500ms even if DOMContentLoaded is delayed
      setTimeout(function() { document.documentElement.classList.add('loaded'); }, 500);
    </script>`;
    finalHTML = finalHTML.replace('</head>', `${antiFOUC}\n</head>`);
  }

  return finalHTML;
}

