import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const intents = {
    recommendation: 'User wants to get suggestions for handicappers/cappers/tipsters or packages',
    performance: 'User is asking about statistics, hot streaks, win rates or track records of a handicappers/cappers/tipsters',
    pricing: 'User is asking about cost, package pricing, budget or payment options',
    comparison: 'User is comparing multiple handicappers or packages',
    general: 'User is asking a general question which does not have clear intent',
};

const examples = {
    recommendation: [
        "Who's the best NFL handicapper?",
        "Recommend me a good capper for basketball",
        "I need help finding the best baseball expert for me"
    ],
    performance: [
        "What's Tokyo Brandon's win rate?",
        "How is Gianni doing this season?",
        "Show me Steve Merril's statistics"
    ],
    pricing: [
        "How much is Tokyo Brandon's packages?",
        "Show me cheap packages for this hockey season",
        "What packages can I buy for under $50"
    ],
    general: [
        "Hello",
        "How does this work?",
        "What even are you?"
    ]
};

const validateClassification = (result, originalQuery) => {
    if (!result.intent) {
        return {
            valid: false,
            reason: 'Missing intent field'
        };
    }

    if (!intents[result.intent]) {
        return {
            valid: false,
            reason: `Invalid intent: ${result.intent}`
        };
    }

    if (!result.confidence || !['high', 'medium', 'low'].includes(result.confidence)) {
        return {
            valid: false,
            reason: 'Invalid or missing confidence level'
        };
    }

    if (result.query !== originalQuery) {
        return {
            valid: false,
            reason: 'Does not match original query'
        };
    }

    return {
        valid: true
    };
}

export const classifyIntent = async (userMessage, conversationHistory = [], attempt = 1) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an intent classification system for a sports betting handicapper platform. Your job is to determine the user's intention and classify it based on the outlined intents.
                  INTENT CATEGORIES:
                  ${Object.entries(intents).map(([intent, def]) => `- ${intent}: ${def}`).join('\n')}
                  
                  CRITICAL REQUIREMENTS:
                  1. You MUST return ONLY valid JSON
                  2. You MUST use one of these exact intent values: ${Object.keys(intents).join(', ')}
                  3. You MUST include a confidence level: high, medium, or low
                  4. Return ONLY a raw JSON object with no formatting, markdown, code blocks or explanations
                  
                  CONFIDENCE GUIDELINES
                  - high: Clear intent defined (e.g. "Who's the best NFL handicapper?")
                  - medium: Intent is clear but could be a mix of multiple classifications (e.g. "Who's the best cheap NBA handicapper?")
                  - low: Unclear what the user's intent is (e.g. "Tell me about Brandon")
                  
                  JSON FORMAT:
                  {
                    "query": "original user query",
                    "intent": "one of the valid intents",
                    "confidence": "high, medium or low",
                    "reasoning" : "brief explanation of why you chose this intent"
                  }
                  `
            },
            ...conversationHistory.slice(-4),
            {
                role: "user",
                content: `Classify this query: "${userMessage}"
                  ${conversationHistory.length > 0 
                    ? `Recent context:\n${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}\n` 
                    : ''}
                    
                  Example classifications:
                  ${Object.entries(examples).map(([intent, examples]) => `${intent}: ${examples.slice(0, 2).join(', ')}`).join('\n')}
                    
                  Return ONLY valid JSON in this exact format:
                  {
                    "query": "${userMessage}",
                    "intent": "selected intent",
                    "confidence": "high, medium or low",
                    "reasoning": "brief explanation of why you chose this intent"
                  }
                  `
            }
        ],
        max_tokens: 150,
        response_format: { type: "json_object" }
    });

    const generatedContent = response.choices[0].message.content;
    const result = JSON.parse(generatedContent);

    console.log('==========| ChatGPT Result |==========');
    console.log(result);
    console.log('======================================');


    try {
        const validation = await validateClassification(result, userMessage);

        if (!validation.valid) {
            if (attempt < 10) {
                const retryDelay = attempt;
                console.warn(`Attempt ${attempt} failed validation: ${validation.reason}. Retrying in ${retryDelay} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
                return classifyIntent(userMessage, conversationHistory, attempt + 1);
            } else {
                console.error(`Failed validation after 10 attempts. Last error: ${validation.reason}`);
                return {
                    query: userMessage,
                    intent: 'general',
                    confidence: 'low',
                    reasoning: 'Fallback as validation failed',
                    validated: false,
                    attempt
                };
            }
        }

        return {
            ...result,
            validated: true,
            attempt
        };
    } catch (error) {
        console.error('Intent classification error:', error);

        if (attempt < 10) {
            console.warn(`Attempt ${attempt} failed. Retrying`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            return classifyIntent(userMessage, conversationHistory, attempt + 1);
        }

        return {
            query: userMessage,
            intent: 'general',
            confidence: 'low',
            reasoning: 'Fallback due to error',
            error: error.message,
            validated: false,
            attempt
        };
    }
};

export const getPossibleIntents = () => intents;

export default {
    classifyIntent,
    getPossibleIntents
}