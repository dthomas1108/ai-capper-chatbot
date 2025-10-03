import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import chatRoutes from './api/chat.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);
app.use('/api', chatRoutes);

app.get('/', (req, res) => {
    res.send('AI Capper Chatbot API running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`APP_ENV: ${process.env.APP_ENV}`);
    console.log(`OpenAI: ${process.env.APP_ENV ? 'enabled' : 'disabled'}`);
    console.log(`Pinecone: ${process.env.PINECONE_API_KEY ? 'enabled' : 'disabled'}`);
    console.log(`MCP_API_URL: ${process.env.MCP_API_URL ? 'enabled' : 'disabled'}`);
});