
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printDirStructure(dirPath: string, indent: string = "") {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);
    console.log(indent + (stats.isDirectory() ? "📁 " : "📄 ") + item);
    if (stats.isDirectory()) {
      printDirStructure(fullPath, indent + "  ");
    }
  }
}

const targetDir = path.resolve(__dirname, "."); // Ab __dirname sahi tarike se milega!
console.log(`Structure of ${targetDir}:`);
printDirStructure(targetDir);