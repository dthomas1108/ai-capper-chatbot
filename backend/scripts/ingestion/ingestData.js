import { getData } from '../../data/getData.js';
import { generateEmbed, upsertVectors, deleteAllVectors } from '../../vector-db/pinecone.js';
import { transformCapper, transformPackage } from "../../vector-db/transform.js";

const BATCH_SIZE = 50;

const processBatch = async (items, transformFn) => {
    const transformedItems = items.map(transformFn);
    const vectors = [];

    for (const item of transformedItems) {
        const embed = await generateEmbed(item.text);
        vectors.push({
            id: item.id,
            values: embed,
            metadata: item.metadata
        });
    }

    if (vectors.length > 0) {
        await upsertVectors(vectors);
    }

    return vectors.length;
};

const ingestData = async (clearExisting = false) => {
    console.log('Starting ingestion...');

    if (clearExisting) {
        console.log('Clearing existing vectors...');
        await deleteAllVectors();
        console.log('Cleared existing vectors');
    }

    const data = getData();
    let totalVectors = 0;

    console.log('Ingesting handicappers...');
    const handicapperCount = await processBatch(data.handicappers, transformCapper);
    totalVectors += handicapperCount;
    console.log(`Ingested ${handicapperCount} handicappers`);

    console.log('Ingesting packages...');
    const packageCount = await processBatch(data.packages, transformPackage);
    totalVectors += packageCount;
    console.log(`Ingested ${packageCount} packages`);

    console.log(`Ingested ${totalVectors} vectors`);
    console.log('Done ingesting data');
};

const clearExisting = process.argv.includes('--clear');
ingestData(clearExisting)
    .then(() => {
        console.log('Ingestion complete');
        process.exit(0);
    })
    .catch(err => {
        console.error('Ingestion failed:', err);
        console.error(err.stack);
        process.exit(1);
    });

export default ingestData;