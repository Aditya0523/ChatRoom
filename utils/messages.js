// This js file is mainly for formatting the messages from text to object

// setting up date and time from the moment.js library
const moment = require('moment') ;


function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a') 
    }
}

module.exports = formatMessage 