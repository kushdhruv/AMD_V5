
/**
 * Takes generated vanilla HTML, CSS, and JS and bundles it into a single
 * self-contained HTML file for iframe preview.
 */
export function bundleForPreview(frontendFiles) {
  // Extract key files
  const htmlContent = frontendFiles["frontend/index.html"] || frontendFiles["index.html"] || "";
  const cssContent = frontendFiles["frontend/style.css"] || frontendFiles["style.css"] || "";
  const jsContent = frontendFiles["frontend/main.js"] || frontendFiles["main.js"] || "";

  // The index.html already comes with the scaffolding, but we want to ensure
  // it's optimized for the preview iframe and uses the generated CSS/JS.
  
  // If we have a full index.html, we can just use it, but let's make sure
  // we can inject the CSS and JS if they are separate files.
  
  let finalHTML = htmlContent;

  // Replace external links with style tags if we have the content
  if (cssContent && finalHTML.includes('<link rel="stylesheet" href="style.css">')) {
    finalHTML = finalHTML.replace(
      '<link rel="stylesheet" href="style.css">',
      `<style>\n${cssContent}\n</style>`
    );
  } else if (cssContent && !finalHTML.includes(cssContent)) {
    finalHTML = finalHTML.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
  }

  // Replace external script with script tag if we have the content
  if (jsContent && finalHTML.includes('<script src="main.js"></script>')) {
    finalHTML = finalHTML.replace(
      '<script src="main.js"></script>',
      `<script>\n${jsContent}\n</script>`
    );
  } else if (jsContent && !finalHTML.includes(jsContent)) {
    finalHTML = finalHTML.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
  }

  // Ensure Tailwind CDN is present for the preview if not already
  if (!finalHTML.includes('cdn.tailwindcss.com')) {
    finalHTML = finalHTML.replace(
      '</head>',
      `<script src="https://cdn.tailwindcss.com"></script>\n</head>`
    );
  }

  return finalHTML;
}
