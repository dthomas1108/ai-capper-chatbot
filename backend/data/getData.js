import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'sample-data.json');

function getData() {
    const raw = fs.readFileSync(dataPath);
    return JSON.parse(raw);
}

export { getData };