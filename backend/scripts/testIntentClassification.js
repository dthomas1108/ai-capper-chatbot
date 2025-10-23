import { classifyIntent } from "../agents/intentClassifier.js";

const testQueries = [
    {
        category: 'RECOMMENDATION',
        expectedIntent: 'recommendation',
        queries: [
            "Who's the best NFL handicapper?",
            "Recommend a good capper for basketball",
            "I need help finding a baseball expert",
            "Show me top performers",
            "Who should I follow for NHL picks?",
            "Best handicapper overall",
            "Looking for someone good at college football",
            "Need a reliable tipster for soccer"
        ]
    },
    {
        category: 'PRICING',
        expectedIntent: 'pricing',
        queries: [
            "How much does it cost?",
            "Show me cheap packages",
            "What packages are under $30?",
            "I have a budget of $50",
            "Affordable NFL picks?",
            "What's the price for Brandon's package?",
            "Do you have any deals?",
            "Cheapest daily picks available?"
        ]
    },
    {
        category: 'COMPARISON',
        expectedIntent: 'comparison',
        queries: [
            "Compare Tokyo Brandon vs Gianni",
            "Who's better for NFL picks?",
            "Brandon or Steve for baseball?",
            "Difference between these two cappers",
            "Which handicapper performs better in playoffs?",
            "Tokyo Brandon versus Kevin Dolan stats",
            "Compare their win rates",
            "Who has the best value between them?"
        ]
    },
    {
        category: 'GENERAL',
        expectedIntent: 'general',
        queries: [
            "Hello",
            "How does this work?",
            "What is a handicapper?",
            "Tell me about your service",
            "How do I sign up?",
            "Can you help me?",
            "I have a question",
            "Thanks for the info"
        ]
    }
];

const runTests = async () => {
    console.log('Testing intent classification');
    console.log('===============================================================');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = [];
    let totalAttempts = 0;

    for (const testGroup of testQueries) {
        console.log('===============================================================');
        console.log(`Testing: ${testGroup.category}`);
        console.log(`Expected Intent: ${testGroup.expectedIntent}`);
        console.log('===============================================================');

        for (let i=0; i < testGroup.queries.length; i++) {
            const query = testGroup.queries[i];
            totalTests++;

            try {
                const result = await classifyIntent(query);
                totalAttempts += result.attempt || 1;

                const passed = result.intent === testGroup.expectedIntent;

                if (passed) {
                    passedTests++;
                    console.log(`[${i + 1}/${testGroup.queries.length}] "${query}"`);
                    console.log(` => ${result.intent} (${result.confidence} confidence)`);
                    if (result.attempt > 1) {
                        console.log(` => Needed ${result.attempt} attempts to pass`);
                    }
                } else {
                    console.log(`[${i + 1}/${testGroup.queries.length}] "${query}"`);
                    console.log(` => Expected: ${testGroup.expectedIntent}`);
                    console.log(` => Got: ${result.intent} (${result.confidence})`);
                    console.log(` => Reason: ${result.reasoning}`);

                    failedTests.push({
                        query,
                        expected: testGroup.expectedIntent,
                        actual: result.intent,
                        confidence: result.confidence,
                        reasoning: result.reasoning,
                        validated: result.validated,
                        category: testGroup.category
                    });
                }
            } catch (error) {
                console.log(`[${i + 1}/${testGroup.queries.length}] "${query}"`);
                console.log(` => Error: ${error.message}`);
                failedTests.push({
                    query,
                    expected: testGroup.expectedIntent,
                    actual: 'ERROR',
                    error: error.message,
                    category: testGroup.category
                });
            }
        }
    }

    console.log('===============================================================');
    console.log('Test Summary');
    console.log('===============================================================');

    const accuracy = ((passedTests / totalTests) * 100).toFixed(1);
    const avgAttempts = (totalAttempts / totalTests).toFixed(2);

    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests.length}`);
    console.log(`Accuracy: ${accuracy}`);
    console.log(`Avg attempts: ${avgAttempts}`);

    if (failedTests.length > 0) {
        console.log('===============================================================');
        console.log('Failed Test Summary');
        console.log('===============================================================');

        const failuresByCategory = {};
        failedTests.forEach(test => {
            if (!failuresByCategory[test.category]) {
                failuresByCategory[test.category] = [];
            }
            failuresByCategory[test.category].push(test);
        });

        Object.entries(failuresByCategory).forEach(([category, failures]) => {
            console.log(`${category}:`);
            failures.forEach((test, idx) => {
                console.log(`${idx + 1}. "${test.query}"`);
                console.log(` => Expected:   ${test.expected}`);
                console.log(` => Got:        ${test.actual}`);
                console.log(` => Confidence: ${test.confidence}`);
                console.log(` => Reasoning:  ${test.reasoning}`);
                console.log(` => Validated:  ${test.validated ? '✅' : '❌'}`);
            });
        });
    }

    console.log('===============================================================');

    if (accuracy >= 90) {
        console.log('High overall accuracy');
    } else if (accuracy >= 75) {
        console.log('Good overall accuracy');
    } else if (accuracy >= 60) {
        console.log('Okay overall accuracy');
    } else {
        console.log('Poor overall accuracy');
    }

    console.log('===============================================================');
};

runTests()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });