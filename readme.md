<!-- Project Logo -->
<p align="center">
  <img src="client/assets/logo.png" alt="Fernando Logo">
</p>

<!-- Project Title -->
<h1 align="center">Fernando - Your Fashion AI Chatbot, that is a cat</h1>

---

## 🌟 Introduction

Meet Fernando, the friendly AI chatbot designed to make choosing the purrrfect outfit! Not just your ordinary style assistant, Fernando takes it a step further by considering the weather, ensuring you're always dressed for success, rain or shine.

---

## 🎩 Features

- **Outfit Suggestions:** Get personalized outfit recommendations based on your occasion, gender, and location.
- **Weather Integration:** Fernando checks the weather forecast and tailors suggestions to the current conditions.
- **Chat Functionality:** Engage in fun and casual conversations with Fernando. It's not just fashion advice; it's a chatbot with personality (sometimes just a grumpy cat)!

---

## 🚀 How to Use

To use Fernando, follow these steps:

1. **Get OpenAI API Key:**
    - Sign up for an account on the OpenAI website.
    - Generate an API key from the OpenAI dashboard.

2. **Get Your WeatherAPI Key:**
    - Sign up for an account on WeatherAPI.
    - Obtain your API key from the WeatherAPI dashboard.

3. **Set Up Your Environment:**
    - Create a `.env` file in the server folder.
    - Add your OpenAI API key and WeatherAPI key to the `.env` file:
      ```env
      OPENAI_API_KEY=your_openai_api_key
      WEATHER_API_KEY=your_weatherapi_key
      ```

4. **Install Dependencies:**
    - Run `npm install` to install the project dependencies. This will install the necessary packages for both the server and the client.

5. **Start the Server:**
    - Run `npm run start` to start the server.
    - And go to the client directory and run `npm run start:both` to start the client.
