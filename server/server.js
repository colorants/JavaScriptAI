import express from 'express';
import cors from 'cors';
import {ChatOpenAI} from "@langchain/openai";
import axios from "axios";
import {RunnableSequence} from "@langchain/core/runnables";
import {UpstashRedisChatMessageHistory} from "@langchain/community/stores/message/upstash_redis";
import {BufferMemory} from "langchain/memory";
import {ChatPromptTemplate} from "@langchain/core/prompts";


const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

router.post('/chat', async (req, res) => {
    try {
        const userInput = req.body.userPrompt;
        let userLocation = 'london'

        // Get local weather information using the OpenWeatherMap API
        const weatherApiKey = process.env.WEATHER_API_KEY;
        const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${userLocation}`;
        const weatherResponse = await axios.get(weatherApiUrl);

        if (weatherResponse.status !== 200) {
            throw new Error(`Weather API request failed with status: ${weatherResponse.status}`);
        }

        const temperature = weatherResponse.data.current.temp_c;
        const weatherDescription = weatherResponse.data.current.condition.text;

        const model = new ChatOpenAI({
            temperature: 0.1,
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
            azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
        });

        const prompt = ChatPromptTemplate.fromTemplate(
           `Before recommending check our history: {history}. 
           
           In 50 words or less.
           You are a chatbot that helps users with making an outfit. Your personality is like the cat from Puss in Boots in the movie Shrek.
         Make a recommendation for an outfit for {userInput}. The user gives their destination and gender.
        The current local weather is ${temperature}°C with ${weatherDescription} tell the user this outcome. 
            Also when you describe what the weather is going to be, repeat back the temperature and
        weather description. example It's going to be sunny in Paris. Don't give an answer in quotation marks.""
       The response should be a funny but smart recommendation.
       
       Also the user will be able to reply to the chatbot's recommendation.

    `);

        const upstashChatHistory = new UpstashRedisChatMessageHistory({
            sessionId: 'chat1',
            config: {
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            }
        })

        const memory = new BufferMemory({
            memoryKey: "history",
            chatHistory: upstashChatHistory,
            input_key: 'userInput', // Specify the input key
            output_key: 'output' // Specify the output key
        });

        const chain = RunnableSequence.from([
            {
                userInput: (initialInput) => initialInput.userInput,
                memory: () => memory.loadMemoryVariables(),
            },
            {
                userInput: (previousOutput) => previousOutput.userInput,
                history: (previousOutput) => previousOutput.memory.history,
            },
           prompt,
            model,
        ]);

        const airesponse = await chain.invoke({
            userInput,
        });

        // This makes sure that the input and output are both seen as (1 key) important!
        let testInput = {
            userInput: userInput
        }
        let testOutput = {
            output: airesponse
        }

        // Saves the memory
        await memory.saveContext(testInput,{
            testOutput
        })

        console.log(JSON.stringify(airesponse));

        res.json(airesponse);

    } catch (error) {
        console.error("Error processing chat query:", error);
        res.status(500).json({ error: "An error occurred while processing the chat query" });
    }
});


// Delays
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function delay() {
    const randomDelay = getRandomDelay(50, 2500); // Random delay between 1 and 3 seconds
    await new Promise(resolve => setTimeout(resolve, randomDelay));
}

app.use('/', router);

const port = process.env.PORT || 8001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});