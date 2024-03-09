const messageInput = document.getElementById('messageInput');
const firstPrompt = document.getElementById('firstPrompt');
const userGender = document.getElementById('userGender');
const userReply = document.getElementById('userReply');
const userLocation = document.getElementById('userLocation');
const submitButton = document.getElementById('submitButton');
const loadingSpinner = document.getElementById('loadingSpinner');
const responseContainer = document.getElementById('responseContainer');
const suggestionContainer = document.getElementById('container2');
const container3 = document.getElementById('container3');
const replyContainer = document.getElementById('replyContainer');

loadingSpinner.style.display = 'none';
loadingSpinner.style.display = 'items-center';


document.addEventListener('keydown', function (event) {
    // Check if the pressed key is Enter (key code 13)
    if (event.key === 'Enter') {
        // Call the retrieveMessage function
        retrieveMessage();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fillSuggestions();
    } catch (error) {
        console.error('Error on DOMContentLoaded:', error);
    }
});


async function sendChatMessage(message, gender, userLocation, userReply) {
    try {
        const userPrompt = `message: ${message}, gender: ${gender}, userLocation: ${userLocation}, reply: ${userReply}`;
        const response = await fetch('http://localhost:8001/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({userPrompt: userPrompt}),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData && responseData.kwargs && responseData.kwargs.content) {
            const aiResponseContent = responseData.kwargs.content;
            displayAiResponse(aiResponseContent);
        } else {
            console.error('No valid AI response found in the response:', responseData);
        }

        return responseData.response;
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
}

async function retrieveMessage() {
    userReply.value='';
    suggestionContainer.style.display = 'none';
    submitButton.style.display = 'none';
    firstPrompt.style.display = 'none';
    try {
        loadingSpinner.style.display = 'block';
        messageInput.value = '';
        userGender.value = '';
        userLocation.value = '';
        await sendChatMessage(
           message,
            gender,
        );


        // Hide loading spinner and show the reply container
        loadingSpinner.style.display = 'none';
        replyContainer.style.display = 'block';
        container3.style.display = 'block';
        submitButton.disabled = false;
        submitButton.style.display = 'inline-block';
    } catch (error) {
        console.error('Error sending chat message:', error.message);
        alert(error.message);

        suggestionContainer.style.display = 'block';
        // Enable input fields and show submit button
        loadingSpinner.style.display = 'none';
        firstPrompt.style.display = 'block';
        messageInput.disabled = false;
        userGender.disabled = false;
        userLocation.disabled = false;
        submitButton.disabled = false;
        submitButton.style.display = 'inline-block';

    }
}

async function fillSuggestions() {
    try {
        const response = await fetch('suggestions.json');
        const suggestions = await response.json();
        const suggestionList = document.querySelector('#suggestionContainer ul');

        suggestionList.innerHTML = '';

        const shuffledSuggestions = shuffleArray(suggestions);

        for (let i = 0; i < Math.min(3, shuffledSuggestions.length); i++) {
            const listItem = document.createElement('li');
            listItem.classList.add('ml-2');
            listItem.textContent = `"${shuffledSuggestions[i]}"`;
            suggestionList.appendChild(listItem);
        }
    } catch (error) {
        console.error('Error filling suggestions:', error);
    }
}

function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

function displayAiResponse(aiResponseContent) {
    const aiMessageContainer = document.createElement('div');
    aiMessageContainer.classList.add('response-grid', 'col-span-3', 'mb-2');

    const aiIcon = document.createElement('i');
    aiIcon.classList.add('fas', 'fa-cat', 'text-black');
    aiMessageContainer.appendChild(aiIcon);

    const aiText = document.createElement('p');
    aiText.classList.add('typewriter', 'pl-4');
    aiText.textContent = aiResponseContent;
    aiMessageContainer.appendChild(aiText);

    responseContainer.appendChild(aiMessageContainer);
}





