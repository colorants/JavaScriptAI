const messageInput = document.getElementById('messageInput');
const firstPrompt = document.getElementById('firstPrompt');
const userGender = document.getElementById('userGender');
const userReply = document.getElementById('userReply');
const userLocation = document.getElementById('userLocation');
const submitButton = document.getElementById('submitButton');
const loadingSpinner = document.getElementById('loadingSpinner');

const suggestionContainer = document.getElementById('container2');

const replyContainer = document.getElementById('replyContainer');
const combinedContainer = document.getElementById('combinedContainer');

loadingSpinner.style.display = 'none';
loadingSpinner.style.display = 'items-center';

let messageCounter = parseInt(localStorage.getItem('messageCounter')) || 0;


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
            displayMessage(aiResponseContent, 'ai');
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
    suggestionContainer.style.display = 'none';
    submitButton.style.display = 'none';
    firstPrompt.style.display = 'none';
    loadingSpinner.style.display = 'block';

    try {
        const aiResponseContent = await sendChatMessage(
            messageInput.value,
            userGender.value,
            userLocation.value,
            userReply.value
        );
        messageCounter++;

        localStorage.setItem('messageCounter', messageCounter.toString());

        if (messageCounter > 1) {
            // Display AI response
            displayMessage(aiResponseContent, 'ai');

            // Display user reply
            displayMessage(userReply.value, 'user');
        } else {
            // Display only AI response for the first message
            displayMessage(aiResponseContent, 'ai');
        }

        userReply.value = '';
        messageInput.value = '';
        userGender.value = '';
        userLocation.value = '';

        // Hide loading spinner and show the reply container
        loadingSpinner.style.display = 'none';
        replyContainer.style.display = 'block';
        combinedContainer.style.display = 'block';
        submitButton.disabled = false;
        submitButton.style.display = 'inline-block';
    } catch (error) {
        console.error('Error sending/retrieving chat message:', error.message);
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

function displayMessage(content, messageType) {
    if (typeof content === 'string') {
        content = content.replace(/^"(.*)"$/, '$1');

        const messageContainer = createMessageContainer(content, messageType);
        appendToResponseContainer(messageContainer, combinedContainer.id, messageType);
    } else {
        console.error(`Invalid ${messageType} content:`, content);
    }
}

function createMessageContainer(content, messageType) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('response-grid', 'col-span-3', 'mb-2', 'flex');

    const messageIcon = document.createElement('i');
    messageIcon.classList.add('fas', messageType === 'ai' ? 'fa-cat' : 'fa-user', 'text-black');
    messageContainer.appendChild(messageIcon);

    const messageText = document.createElement('p');
    messageText.classList.add('typewriter', 'pl-4');
    messageText.textContent = content;
    messageContainer.appendChild(messageText);

    // Add a class to distinguish between AI and user messages
    messageContainer.classList.add(messageType === 'ai' ? 'ai-message' : 'user-message');

    return messageContainer;
}

function appendToResponseContainer(messageContainer, containerId, messageType) {
    const responseContainer = document.getElementById(containerId);
    if (responseContainer) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('response-container');

        // Add a class to distinguish between AI and user messages
        messageWrapper.classList.add(messageType === 'ai' ? 'ai-message' : 'user-message');

        messageWrapper.appendChild(messageContainer);

        // Append the new message to the beginning of the container
        responseContainer.insertBefore(messageWrapper, responseContainer.firstChild);
    }
}






