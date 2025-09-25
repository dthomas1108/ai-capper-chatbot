import express from 'express';
import { getIntent } from '../agents/intent.js';
import { getData } from '../data/getData.js';

const router = express.Router();

const intentHandlers = {
    recommendation: (data, message) => {
        const sports = ['nfl', 'nba', 'mlb', 'nhl'];
        const mentionedSport = sports.find(sport => message.toLowerCase().includes(sport));

        let filteredCappers = data.handicappers;

        if (mentionedSport) {
            filteredCappers = data.handicappers.filter(capper =>
                capper.sports?.some(sport =>
                    sport.toLowerCase().includes(mentionedSport)
                )
            );
        }

        if (filteredCappers.length === 0) {
            return {
                reply: `Sorry, no cappers found for ${mentionedSport?.toUpperCase()}. Try asking about NFL, NBA, MLB or NHL`,
                data: { availableSports: sports }
            };
        }

        // Sort by win %
        const bestCapper = filteredCappers.sort((a, b) => b.currentStats.winPercentage - a.currentStats.winPercentage)[0];

        const sportText = mentionedSport ? ` for ${mentionedSport.toUpperCase()}` : '';

        return {
            reply: `I recommend ${bestCapper.name}${sportText} with a ${bestCapper.currentStats.winPercentage}% win rate and ${bestCapper.currentStats.totalPicks} total picks.`,
            data: {
                capper: bestCapper,
                sport: mentionedSport,
                alternatives: filteredCappers.slice(1, 3)
            }
        };
    },

    pricing: (data, message) => {
        const priceMatch = message.match(/\$?(\d+)/);
        const maxPrice = priceMatch ? parseInt(priceMatch[1]) : 50;

        const affordablePackages = data.packages
            .filter(pkg => pkg.price <= maxPrice)
            .sort((a, b) => a.price - b.price)
            .slice(0, 5);

        if (affordablePackages.length === 0) {
            return {
                reply: `No packages found under $${maxPrice}. Our cheapest package starts at $${Math.min(...data.packages.map(p => p.price))}.`,
                data: {requestedPrice: maxPrice}
            };
        }

        const packageList = affordablePackages
            .map(pkg => `${pkg.title} ($${pkg.price})`)
            .join(', ');

        return {
            reply: `Packages under $${maxPrice}: ${packageList}`,
            data: {
                packages: affordablePackages,
                requestedPrice: maxPrice,
                totalFound: affordablePackages.length
            }
        };
    },

    performance: (data, message) => {
        const topPerformers = data.handicappers
            .sort((a, b) => b.currentStats.winPercentage - a.currentStats.winPercentage)
            .slice(0, 3);

        const performanceList = topPerformers
            .map((capper, index) =>
                `${index + 1}. ${capper.name}: ${capper.currentStats.winPercentage}% (${capper.currentStats.totalPicks} picks)`
            )
            .join('\n');

        return {
            reply: `Top 3 performers:\n${performanceList}`,
            data: {
                topPerformers,
                averageWinRate: (topPerformers.reduce((sum, c) => sum + c.currentStats.winPercentage, 0) / topPerformers.length).toFixed(1)
            }
        };
    },

    comparison: (data, message) => {
        // Try to extract capper names from the message
        const capperNames = data.handicappers
            .filter(capper => message.toLowerCase().includes(capper.name.toLowerCase()))
            .slice(0, 2);

        if (capperNames.length < 2) {
            const top3 = data.handicappers
                .sort((a, b) => b.currentStats.winPercentage - a.currentStats.winPercentage)
                .slice(0, 3);

            const comparison = top3
                .map(c => `${c.name}: ${c.currentStats.winPercentage}%`)
                .join(' vs ');

            return {
                reply: `Here's a comparison of our top 3: ${comparison}`,
                data: { comparedCappers: top3 }
            };
        }

        const comparison = capperNames
            .map(c => `${c.name}: ${c.currentStats.winPercentage}% win rate, ${c.currentStats.totalPicks} picks`)
            .join(' | ');

        return {
            reply: `Comparison: ${comparison}`,
            data: { comparedCappers: capperNames }
        };
    }
};

const validateMessage = (req, res, next) => {
    const { message } = req.body;

    if (!message.trim()) {
        return res.status(400).json({
            error: 'Message is required',
            suggestions: ['Who is the best capper?', 'Show me packages under $30', 'Compare top performers']
        });
    }

    // Limit message length
    req.body.message = message.trim().substring(0, 500);
    next();
};

router.post('/chat', validateMessage, async (req, res) => {
    try {
        const { message } = req.body;
        const data = getData();

        if (!data?.handicappers?.length) {
            return res.status(503).json({
                error: 'Service temporarily unavailable - data not loaded'
            });
        }

        const intent = getIntent(message, data.intentExamples || {});
        const handler = intentHandlers[intent];

        if (handler) {
            const result = handler(data, message);
            return res.json({
                reply: result.reply,
                intent,
                confidence: 'high',
                data: result.data,
                timestamp: new Date().toISOString()
            });
        }

        // Enhanced fallback with smart suggestions
        const suggestions = [
            "Who's the best capper?",
            "Show me packages under $50",
            "Compare top performers",
            "What are the NFL win rates?"
        ];

        return res.json({
            reply: "I can help you find the best cappers and packages! Try asking about recommendations, pricing, or performance comparisons.",
            intent: 'fallback',
            confidence: 'low',
            suggestions,
            availableIntents: Object.keys(intentHandlers),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({
            error: 'Sorry, something went wrong. Please try again.',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;