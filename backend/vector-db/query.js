import { generateEmbed, queryVectors } from './pinecone.js';

export const searchHandicappers = async (query, options = {}) => {
    const { sports = [], minWinRate = 0, topK = 10} = options;

    /*
     * Metadata can be directy filtered before semantic search
     * https://docs.pinecone.io/guides/index-data/indexing-overview#metadata
     *
     * $eq - Equals
     * $in - in Array
     * $gte - Greater than or equal
     */
    const filter = { type: { $eq: 'handicapper' } };
    if (sports.length > 0) {
        filter.sports = { $in: sports };
    }
    if (minWinRate > 0) {
        filter.winPercentage = { $gte: minWinRate };
    }

    const queryVector = await generateEmbed(query);
    const results = await queryVectors(queryVector, { filter, topK });

    return results.matches.map(match => ({
        id: match.id,
        score: match.score,
        ...match.metadata

    }));
};

export const searchPackages = async (query, options = {}) => {
    const { sports = [], maxPrice = null, packageType = null, topK = 10} = options;

    const filter = { type: { $eq: 'package' } };

    if (sports.length > 0) {
        filter.sports = { $in: sports };
    }

    if (maxPrice !== null) {
        filter.price = { $lte: maxPrice };
    }

    if (packageType) {
        filter.packageType = { $eq: packageType };
    }

    const queryVector = await generateEmbed(query);
    const results = await queryVectors(queryVector, { filter, topK });

    return results.matches.map(match => ({
        id: match.id,
        score: match.score,
        ...match.metadata
    }));
};

export const searchAll = async (query, options = {}) => {
    const { topK = 10 } = options;
    const queryVector = await generateEmbed(query);
    const results = await queryVectors(queryVector, { topK });

    return results.matches.map(match => ({
        id: match.id,
        score: match.score,
        ...match.metadata
    }));
};

export default {
    searchHandicappers,
    searchPackages,
    searchAll
};