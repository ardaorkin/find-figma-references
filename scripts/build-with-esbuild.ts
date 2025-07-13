import esbuild from "esbuild";
import config from "./esbuild.config";
import { copyFileSync, mkdirSync } from "fs";
import { dirname } from "path";

async function buildExtension() {
  try {
    // Build the extension
    await esbuild.build(config);
    console.log("✅ Extension built successfully");

    // Copy webview HTML file to dist folder
    const sourceHtmlPath = "./src/ui/webview.html";
    const destHtmlPath = "./dist/ui/webview.html";

    // Create ui directory if it doesn't exist
    mkdirSync(dirname(destHtmlPath), { recursive: true });

    // Copy the HTML file
    copyFileSync(sourceHtmlPath, destHtmlPath);
    console.log("✅ Webview HTML copied to dist folder");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

buildExtension();
