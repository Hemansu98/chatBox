const socket = io();


// DOM elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages =document.querySelector('#messages');

// Template 
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-message-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// outputs
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;


    // visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of the message container
    const containerHeight = $messages.scrollHeight;

    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    //console.log(message);
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('shareLocation', (location) => {
    const html = Mustache.render($locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:m a')
    });
    
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room , users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    });

    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable the send button once it's clicked until message is delivered
    $messageFormButton.setAttribute('disabled', 'disabled');

    var message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        // Enable the send button when message has been delivered
        $messageFormButton.removeAttribute('disabled');
        
        // Erasing the previous message from the input
        $messageFormInput.value = '';

        $messageFormInput.focus();

        if(error) {
            return console.log(error);
        }
        console.log("Message delivered!");
    });
}); 

// setting up eventhandler for sharing location
$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported in your browser');
    }

    // Disable the share location button when it's clicked untill the event is acknowledged
    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {

        
        socket.emit('share-location', { 
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },() => {

            // Enabling the share location button 
            $locationButton.removeAttribute('disabled');
            console.log('Location is shared!');
        });
    });
});


socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }   
});