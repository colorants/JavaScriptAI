import express from 'express';
import cors from 'cors';
import {ChatOpenAI} from "@langchain/openai";
import axios from "axios";


const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

let isModelInitialized = false;

router.post('/chat', async (req, res) => {
    try {

const userInput = req.body.userInput;
const userGender = req.body.userGender;
const location = req.body.userLocation;

        // Get local weather information using the OpenWeatherMap API
        const weatherApiKey = process.env.WEATHER_API_KEY;
        const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${location}`;
        const weatherResponse = await axios.get(weatherApiUrl);

        let temperature = weatherResponse.data.current.temp_c;
        let weatherDescription = weatherResponse.data.current.condition.text;



    const model = new ChatOpenAI({
    temperature: 0.1,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});
// Assuming that the ChatOpenAI constructor internally initializes the model
isModelInitialized = true;
        const promptTemplate =
            `Make a recommendation for an outfit for a {userGender} who is going {userInput}.
            The current local weather is ${temperature}°C with ${weatherDescription}.
            Respond like the cat from Puss in Boots in the movie Shrek. Also make it maximum 30 words long.
            And don't reply back the question.`;


        const prompt = promptTemplate
            .replace ("{userGender}", userGender)
            .replace ("{userInput}", userInput);


        const response = await model.invoke(prompt);
        console.log(JSON.stringify(response));

        res.json(response);

    } catch (error) {
        console.error("Error processing chat query:", error);
        res.status(500).json({ error: "An error occurred while processing the chat query" });
    }
});

app.get('/status', (req, res) => {
    if (isModelInitialized ) {
        res.status(200).json({ status: 'ok', message: 'Server is online' });
    } else {
        res.status(500).json({ status: 'error', message: 'OpenAI model is not initialized' });
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
