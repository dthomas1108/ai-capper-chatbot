const defaultKeywords = {
    recommendation: ['recommend', 'best', 'top', 'good', 'suggest', 'who should', 'which capper'],
    pricing: ['price', 'cost', 'cheap', 'budget', 'how much', '$', 'under', 'packages'],
    performance: ['win rate', 'performance', 'stats', 'record', 'wins', 'track record'],
    comparison: ['compare', 'vs', 'versus', 'better', 'difference', 'which is better']
};

export const getIntent = (message, customExamples = {}) => {
    const cleanedMessage = message.toLowerCase().trim();

    const allKeywords = { ...defaultKeywords };

    // Add custom keywords if provided
    Object.entries(customExamples).forEach(([intent, examples]) => {
        if (!allKeywords[intent]) allKeywords[intent] = [];
        allKeywords[intent].push(...examples);
    });

    //Check for matches
    for (const [intent, keywords] of Object.entries(allKeywords)) {
        for (const keyword of keywords) {
            if (cleanedMessage.includes(keyword.toLowerCase())) {
                return intent;
            }
        }
    }

    return 'Unknown'
};

export default { getIntent };