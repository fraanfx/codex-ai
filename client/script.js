import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');


//const speechedText = /*new SpeechRecognition() ||*/ new webkitSpeechRecognition();


window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechedText = new window.SpeechRecognition();
speechedText.lang = navigator.language || navigator.userLanguage || 'en-US' ||'es-ES';
speechedText.continuos = true;
speechedText.interimResults = false;

const theTextArea = document.querySelector('textarea');
speechedText.onresult = (event) => {
  const results =  event.results;
  const frase = results[results.length-1][0].transcript;
  theTextArea.value = frase;
  console.log(results)
}



const btnStartRecord = document.getElementById('recordBtn');
btnStartRecord.addEventListener('click' , () => {
  speechedText.start();
})
btnStartRecord.addEventListener('doubleclick' , () => {
  speechedText.abort();
})

const readText = (text) => {
      const speech = new SpeechSynthesisUtterance();
      speech.lang = navigator.language || navigator.userLanguage || 'en-US' ||'es-ES';
      speech.text = text;
      speech.volume = 1;
      speech.rate = 1; 
      speech.pitch = 1;

      window.speechSynthesis.speak(speech);

    }

    
    


let loadInterval;

function loader(element) {
   element.textContent = '';

   loadInterval =  setInterval(() =>{
      element.textContent += '.';

      if(element.textContent === '....') { 
        element.textContent = '';
      }
   }, 300)
}


function typeText (element, text) {
  let index = 0; 

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index); 
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
   const timestamp = Date.now();
   const randomNumber =  Math.random();
   const hexadecimalString = randomNumber.toString(16);

   return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return(
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>
              ${value}
          </div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const data = new FormData(form);

  //user's chatstripe

  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  //bot's chatstripe

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  console.log(uniqueId)
  console.log(messageDiv)
  loader(messageDiv);

  //fetch data from server
  const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }, body: JSON.stringify({
          prompt: data.get('prompt')
        })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = ' ';

  if(response.ok){
    //console.log(response.json())
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
    readText(parsedData)
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Something went wrong';

    alert(err);
  }
}



form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13) {
    handleSubmit(e);
  }
})

const messageClicked = (event) =>{
  console.log(event)
 let tempMessage = event.target.value;
 readText(tempMessage);
}

if(document.querySelector('.message')){
  document.querySelector('.message').messageClicked(e)
}
