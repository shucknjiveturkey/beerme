//This is an Alexa app named Beer Me Rook
/*You will be able to request local breweries by the requested city. The types of beers they serve, and their location so you can visit.
*/

"use strict";
var APP_ID = 'amzn1.echo-sdk-ams.app.726ed6f8-c5f6-485e-a012-72e3066e8169';

var http = require('http');

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * BeerMe is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var BeerMe = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
BeerMe.prototype = Object.create(AlexaSkill.prototype);
BeerMe.prototype.constructor = BeerMe;

// ----------------------- Override AlexaSkill request and intent handlers -----------------------

BeerMe.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

BeerMe.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
	
    handleBeerRequest(response);
};

BeerMe.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

/**
 * override intentHandlers to map intent handling functions.
 */
BeerMe.prototype.intentHandlers = {
    "OneshotBeerIntent": function (intent, session, response) {
		
        handleOneshotBeerRequest(intent, session, response);
		
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};


//welcome request function
function handleBeerRequest(response) {
	
    var whichBeerPrompt = "Which city are you searching for breweries in? ";
    var speechOutput = { 
		speech: "<speak>Welcome to Beer Me Rook. " + whichBeerPrompt + "</speak>", 
		type: AlexaSkill.speechOutputType.SSML 
	};
    var repromptOutput = {
            speech: "I can tell you all about local breweries you are wondering about. Let\'s just start off with the city you are asking about. " + whichBeerPrompt,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT 
		};
	
    response.ask(speechOutput, repromptOutput);
	
}

//handle help request
function handleHelpRequest(response) {
    var repromptText = "Which city would you like beer information for?";
    var speechOutput = "I can help you find beer, just give me a city to search. " + repromptText;
	
    response.ask(speechOutput, repromptText);
	
}

//list of the current breweries
var BREWERIES = {
	'chicago':'chicago',
	'detroit':'detroit',
	'indianola':'indianola'
};

//get the city from intent
function getCityBreweryFromIntent(intent, assignDefault) {

    var citySlot = intent.slots.City;
    
    if (!citySlot || !citySlot.value) {
        if (!assignDefault) {
            return {
                error: true
            };
        } else {
            // For sample skill, default to Chicago.
            return {
                city: 'chicago',
                brewery: BREWERIES.chicago
            };
        }
    } else {
        // lookup the city. Sample skill uses well known mapping of a few known cities to station id.
        var cityName = citySlot.value;
        if (BREWERIES[cityName.toLowerCase()]) {
            return {
                city: cityName,
                brewery: BREWERIES[cityName.toLowerCase()]
            };
        } else {
            return {
                error: true,
                city: cityName
            };
        }
    }
}

//return information about the city of the brewery
function handleOneshotBeerRequest(intent, session, response){
	var cityBrewery = getCityBreweryFromIntent(intent, true);
	var repromptText;
    var speechOutput;
    if (cityBrewery.error) {
        // invalid city. move to the dialog
        repromptText = "Currently, I have beer information for: " + getAllBreweriesText() + " Which city would you like beer information for?";
        // if we received a value for the incorrect city, repeat it to the user, otherwise we received an empty slot
        speechOutput = cityBrewery.city ? "I'm sorry, I don't have any data for " + cityBrewery.city + ". " + repromptText : repromptText;
		console.log("cherry pie");
        response.ask(speechOutput, repromptText);
        return;
    }


    // all slots filled, either from the user or by default values. Move to final request
    getMyBrewery(cityBrewery, response);
}

//final request yo
function getMyBrewery(cityBrewery,response){
	var speechOutput = cityBrewery.city;
	response.tellWithCard("BeerMe", speechOutput);
}

//returns a list of cities that have breweries
function getAllBreweriesText() {
    var breweryList = '';
    for (var brewery in BREWERIES) {
        breweryList += brewery + ", ";
    }

    return breweryList;
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var beerMe = new BeerMe();
    beerMe.execute(event, context);
};

