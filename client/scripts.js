const messageInput = document.getElementById('messageInput');
const userGender = document.getElementById('userGender');
const userLocation = document.getElementById('userLocation');
const submitButton = document.getElementById('submitButton');
const loadingSpinner = document.getElementById('loadingSpinner');
const responseContainer = document.getElementById('responseContainer');
const responseText = document.getElementById('responseText');
const serverStatusText = document.getElementById('serverStatusText');
const container2 = document.getElementById('container2');
const container3 = document.getElementById('container3');

container3.style.display = 'none';
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
        await checkServerStatus();
        await updateServerStatus();
        await fillSuggestions();
    } catch (error) {
        console.error('Error on DOMContentLoaded:', error);
    }
});

async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:8001/status');
        const { status, message } = await response.json();

        if (status === 'ok') {
            updateServerStatus('Connected', 'green', message);
        } else {
            updateServerStatus('Disconnected', 'rgb(220, 20, 60)', message);
        }
    } catch (error) {
        console.error('Error checking server status:', error);
        updateServerStatus('Disconnected', 'rgb(220, 20, 60)', 'Error checking server status');
    }
}

function updateServerStatus(statusText, color) {
    serverStatusText.textContent = statusText;
    serverStatusText.style.color = color;
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

async function sendChatMessage(message, gender, location) {
    try {
        if (message !== "" || gender !== "" || location !== "") {
            const response = await fetch('http://localhost:8001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: message, userGender: gender, userLocation: location}),
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
                responseText.innerText = 'No valid AI response found.';
            }

            return responseData.response;
        } else {
            responseText.innerText = 'Please enter a message.';
            return null;
        }
    } catch (error) {
        throw new Error(`Error sending chat message: ${error.message}`);
    }
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


async function retrieveMessage() {
    container3.style.display = 'none';
    messageInput.disabled = true;
    userGender.disabled = true;
    userLocation.disabled = true;
    submitButton.disabled = true;
    loadingSpinner.style.display = 'block';
    submitButton.style.display = 'none';
    container2.style.display = 'none';

    const message = messageInput.value.trim();
    const gender = userGender.value.trim();
    const location = userLocation.value

    try {
        if (message === '' || gender === '' || location === '') {
            throw new Error('Please fill in message, gender fields and your location. ');
        }

        await sendChatMessage(message, gender);

        container3.style.display = 'block';
        submitButton.disabled = false;
        messageInput.disabled = false;
        userGender.disabled = false;
        userLocation.disabled = false;
        loadingSpinner.style.display = 'none';
        messageInput.value = '';
        userGender.value = '';
        userLocation.value = '';
        submitButton.style.display = 'inline-block';
    } catch (error) {
        console.error('Error sending chat message:', error.message);
        alert(error.message);

        submitButton.disabled = false;
        messageInput.disabled = false;
        userGender.disabled = false;
        userLocation.disabled = false;
        loadingSpinner.style.display = 'none';
        messageInput.value = '';
        userGender.value = '';
        userLocation.value = '';
        submitButton.style.display = 'inline-block';
    }
}

function typewriterEffect(element, text) {
    element.textContent = "";
    let speed = 15;
    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}
