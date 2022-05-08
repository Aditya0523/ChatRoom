// The message box before sending is a form with id "chat-form"
// So we are trying to create an eventListener for that chat form
const chatForm = document.getElementById('chat-form') ;
const chatMessages = document.querySelector('.chat-messages') ;

const roomName = document.getElementById('room-name') ;
const userList = document.getElementById('users') ;

// Get username  and room from the URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true 
}) ;

//  because of the script tag we added we now have access to the io()
const socket = io() ;

// Join chatroom
socket.emit('joinRoom', {username, room}) ;

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room) ;
    outputUsers(users) ;
}) ;

//To catch the events emitted from server on the client side
socket.on('message', message => {
    console.log(message) ;
    // To witness this open your client side console that is inspect in the browser

    outputMessage(message) ;

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight ;

})


// So we are trying to create an eventListener for that chat form
// Message submit
chatForm.addEventListener('submit', (e) => {
    // when you submit a form it automatically submits to a file. so to prevent the default
    e.preventDefault() ;

    // the <input> has id of "msg", we can access that
    // Get message text
    const msg = e.target.elements.msg.value ;

    // Emit message to the server
    socket.emit('chatMessage', msg) ;

    // Clear input
    e.target.elements.msg.value = '' ;
    e.target.elements.msg.focus() ;
})


// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div') ;
    div.classList.add('message') ;
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">
                       ${message.text}
                    </p>` ;
    if(message.username === 'Wassuuup bot')
    {
        div.style.background = "#90EE90" ;
        div.style.margin = "10px auto 15px auto" ;
    }   
    document.querySelector('.chat-messages').appendChild(div) ;
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room ;
}

//Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => 
            `<li>${user.username}</li>`
        ).join('')}
    ` ;
}