import express from 'express';
import cors from 'cors';
import {ChatOpenAI} from "@langchain/openai";
import axios from "axios";


const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

router.post('/chat', async (req, res) => {
    try {
        const userInput = req.body.userInput;
        const userGender = req.body.userGender;
        const userLocation = req.body.location; // Retrieve user's location from the request body

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

        const promptTemplate =
            `Make a recommendation for an outfit for a {userGender} who is going to {userInput}.
            The current local weather is ${temperature}°C with ${weatherDescription} tell the user this outcome.
            Respond like the cat from Puss in Boots in the movie Shrek. Also make it maximum 50 words long.
           Also when you describe what the weather is going to be, repeat back the temperature and 
           weather description. example "It's going to be sunny in Paris". Don't give an answer in quotes.
            
            `;

        const prompt = promptTemplate
            .replace("{userGender}", userGender)
            .replace("{userInput}", userInput);

        const response = await model.invoke(prompt);

        console.log(JSON.stringify(response));

        res.json(response);

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