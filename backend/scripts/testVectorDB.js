import {
    searchHandicappers,
    searchPackages,
    searchAll
} from '../vector-db/query.js';

const testQueries = [
    {
        name: 'Best NFL handicapper',
        query: 'Best NFL handicapper with a high win rate',
        search: searchHandicappers,
        options: { sports: ['NFL'], minWinRate: 60, topK: 5 }
    },
    {
        name: 'Affordable MLB packages',
        query: 'Cheap MLB picks fro under $30',
        search: searchPackages,
        options: { sports: ['MLB'], maxPrice: 30, topK: 7 }
    },
    {
        name: 'UFC expert',
        query: ' UFC MMA fighting expert which has a good record',
        search: searchHandicappers,
        options: { topK: 3 }
    },
    {
        name: 'General search',
        query: 'Show me Tokyo Brandon\'s performance',
        search: searchAll,
        options: { topK: 5 }
    }
];

const runTests = async () => {
    console.log('Testing vector database');
    console.log('===============================================================');

    for (const test of testQueries) {
        console.log(`Test: ${test.name}`);
        console.log(`Test Query: ${test.query}`);
        console.log('===============================================================');

        try {
            const results = await test.search(test.query, test.options);

            if (results.length === 0) {
                console.log('No results found');
            } else {
                results.forEach((result, index) => {
                    console.log(`${index + 1}. ${result.name}`);
                    console.log(`Score: ${result.score}`);
                    console.log(`Type: ${result.type}`);

                    if (result.winPercentage) {
                        console.log(`Win Rate: ${result.winPercentage}%`);
                    }

                    if (result.price) {
                        console.log(`Price: $${result.price}`);
                    }
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    console.log('===============================================================');
    console.log('Tests completed.');
};

runTests()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });