import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY_TELEGRAM_MSG_GEN
});

const basicFallback = (message) => {
  const lowercaseMessage = message.toLowerCase();

  const sports = [];
  if (lowercaseMessage.includes('nfl') || lowercaseMessage.includes('football')) sports.push('NFL');
  if (lowercaseMessage.includes('nba') || lowercaseMessage.includes('basketball')) sports.push('NBA');
  if (lowercaseMessage.includes('mlb') || lowercaseMessage.includes('baseball')) sports.push('MLB');
  if (lowercaseMessage.includes('nhl') || lowercaseMessage.includes('hockey')) sports.push('NHL');

  let intent = 'Unknown';
  if (lowercaseMessage.includes('recommend') || lowercaseMessage.includes('best')) sports.push('recommendation');
  if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost')) sports.push('pricing');
  if (lowercaseMessage.includes('compare') || lowercaseMessage.includes('vs')) sports.push('comparison');
  if (lowercaseMessage.includes('performance') || lowercaseMessage.includes('stats')) sports.push('performance');

  return {
      original: message,
      intent,
      entities: { sports },
      fallback: true
  };
};

export const queryEnhancer = async (message, history = []) => {
    try {
        const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a query analysis and enhancement system for a sports betting handicapper platform.` },
                ],
            }
        )
    } catch (error) {}
}