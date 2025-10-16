import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME;

export const initialiseIndex = async () => {
    const existingIndexes = await pc.listIndexes();
    const indexExists = existingIndexes.indexes?.some(i => i.name === INDEX_NAME);

    if (!indexExists) {
        await pc.createIndex({
            name: INDEX_NAME,
            dimension: 1536,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1',
                }
            }
        });

        await waitForIndexReady();
    }

    return pc.index(INDEX_NAME);
};

const waitForIndexReady = async () => {
    let isReady = false;
    while (!isReady) {
        const description = await pc.describeIndex(INDEX_NAME);
        isReady = description.status?.ready;
        if (!isReady) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

export const generateEmbed = async (text) => {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
    });

    return response.data[0].embedding;
};

export const upsertVectors = async (vectors) => {
    const index = await initialiseIndex();
    await index.upsert(vectors);
};

export const queryVectors = async (queryVector, options = {}) => {
    const index = await initialiseIndex();
    const { topK = 10, filter = {}, includeMetadata = true } = options;

    const queryParams = {
        vector: queryVector,
        topK,
        includeMetadata,
    };

    if (Object.keys(filter).length > 0) {
        queryParams.filter = filter;
    }

    return await index.query(queryParams);
};

export const deleteAllVectors = async () => {
    const index = await initialiseIndex();
    await index.deleteAll();
};

export default {
    initialiseIndex,
    upsertVectors,
    queryVectors,
    deleteAllVectors,
    generateEmbed,
};