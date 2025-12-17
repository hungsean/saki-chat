import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_PATH = path.join(__dirname, '../dist');
const MAX_BUNDLE_SIZE = 10 * 1024 * 1024; // 10MB (includes matrix-js-sdk WASM ~5.3MB)
const MAX_JS_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_CSS_SIZE = 500 * 1024; // 500KB

function getDirectorySize(dirPath) {
  let totalSize = 0;

  function traverse(currentPath) {
    const stats = fs.statSync(currentPath);

    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach((file) => {
        traverse(path.join(currentPath, file));
      });
    }
  }

  traverse(dirPath);
  return totalSize;
}

function getFilesByExtension(dirPath, extension) {
  const files = [];

  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isFile() && fullPath.endsWith(extension)) {
        files.push({ path: fullPath, size: stats.size });
      } else if (stats.isDirectory()) {
        traverse(fullPath);
      }
    });
  }

  traverse(dirPath);
  return files;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function checkBundleSize() {
  if (!fs.existsSync(DIST_PATH)) {
    console.error('❌ Build output not found. Please run build first.');
    process.exit(1);
  }

  const totalSize = getDirectorySize(DIST_PATH);
  const jsFiles = getFilesByExtension(DIST_PATH, '.js');
  const cssFiles = getFilesByExtension(DIST_PATH, '.css');

  const totalJsSize = jsFiles.reduce((acc, file) => acc + file.size, 0);
  const totalCssSize = cssFiles.reduce((acc, file) => acc + file.size, 0);

  console.log('\n📦 Bundle Size Report\n');
  console.log('─'.repeat(60));
  console.log(`Total Bundle Size: ${formatSize(totalSize)}`);
  console.log(`JavaScript Size:   ${formatSize(totalJsSize)}`);
  console.log(`CSS Size:          ${formatSize(totalCssSize)}`);
  console.log('─'.repeat(60));

  let hasError = false;

  if (totalSize > MAX_BUNDLE_SIZE) {
    console.error(
      `❌ Total bundle size (${formatSize(totalSize)}) exceeds limit (${formatSize(MAX_BUNDLE_SIZE)})`
    );
    hasError = true;
  } else {
    console.log(
      `✅ Total bundle size is within limit (${formatSize(MAX_BUNDLE_SIZE)})`
    );
  }

  if (totalJsSize > MAX_JS_SIZE) {
    console.error(
      `❌ JavaScript size (${formatSize(totalJsSize)}) exceeds limit (${formatSize(MAX_JS_SIZE)})`
    );
    hasError = true;
  } else {
    console.log(
      `✅ JavaScript size is within limit (${formatSize(MAX_JS_SIZE)})`
    );
  }

  if (totalCssSize > MAX_CSS_SIZE) {
    console.error(
      `❌ CSS size (${formatSize(totalCssSize)}) exceeds limit (${formatSize(MAX_CSS_SIZE)})`
    );
    hasError = true;
  } else {
    console.log(`✅ CSS size is within limit (${formatSize(MAX_CSS_SIZE)})`);
  }

  console.log('─'.repeat(60));

  if (jsFiles.length > 0) {
    console.log('\n📄 Largest JavaScript Files:\n');
    jsFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .forEach((file) => {
        const relativePath = path.relative(DIST_PATH, file.path);
        console.log(`  ${relativePath.padEnd(40)} ${formatSize(file.size)}`);
      });
  }

  if (cssFiles.length > 0) {
    console.log('\n🎨 Largest CSS Files:\n');
    cssFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .forEach((file) => {
        const relativePath = path.relative(DIST_PATH, file.path);
        console.log(`  ${relativePath.padEnd(40)} ${formatSize(file.size)}`);
      });
  }

  console.log('\n');

  if (hasError) {
    console.error('❌ Bundle size check failed!\n');
    process.exit(1);
  } else {
    console.log('✅ All bundle size checks passed!\n');
    process.exit(0);
  }
}

checkBundleSize();
