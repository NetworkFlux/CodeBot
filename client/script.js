// Import images from assets folder
import bot from './assets/bot.svg';
import user from './assets/user.svg';

// Retrieve some html elements
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
chatContainer.scrollTop = chatContainer.scrollHeight;


let loadInterval;

// Function that will show a loading animation
function Loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent.length > 3) {
      element.textContent = '';
    }
  }, 300)
}

// Function that will output the response character by character
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      chatContainer.scrollTo(0, document.body.scrollHeight);
    } else {
      clearInterval(interval);
    }
  }, 20)
}


// Generate a unique id for each message
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// Function that separates the messages send by the user
// or the bot in order to display a different background color
function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id="${uniqueId}">${value}</div>
        </div>
      </div>
    `
  )
}

// Function that will handle the submit event
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // Bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  Loader(messageDiv);

  // Fetch data from the server
  const response = await fetch('https://codebot-nzk8.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong."
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})