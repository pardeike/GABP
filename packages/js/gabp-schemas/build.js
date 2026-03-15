const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const sourceDir = path.join(repoRoot, 'SCHEMA', '1.0');
const targetDir = path.join(__dirname, 'schemas');

function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeDir(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  }

  fs.rmdirSync(dirPath);
}

function copyDir(sourcePath, destinationPath) {
  fs.mkdirSync(destinationPath, { recursive: true });

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    const sourceEntryPath = path.join(sourcePath, entry.name);
    const destinationEntryPath = path.join(destinationPath, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourceEntryPath, destinationEntryPath);
    } else {
      fs.copyFileSync(sourceEntryPath, destinationEntryPath);
    }
  }
}

if (!fs.existsSync(sourceDir)) {
  console.log(`Source schema directory not found at ${sourceDir}; keeping bundled schemas as-is.`);
  process.exit(0);
}

removeDir(targetDir);
copyDir(sourceDir, targetDir);

console.log(`Synced schemas from ${sourceDir} to ${targetDir}.`);
