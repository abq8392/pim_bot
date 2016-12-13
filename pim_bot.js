var Botkit = require('botkit');
var userCmd = require('./userCmd.js');

var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pim_bot';
var mongoStorage = require('botkit-storage-mongo')({ mongoUri: mongoUri });
var port = process.env.PORT || 5000;

if (!process.env.clientId || !process.env.clientSecret || !port) {
    console.log('Error: Specify clientId clientSecret and port in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({
    interactive_replies: true, // tells botkit to send button clicks into conversations
    storage: mongoStorage,
}).configureSlackApp({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    scopes: ['bot', 'command'],
});

controller.setupWebserver(port, function(err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);
    controller.createHomepageEndpoint(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });

});

var _bots = {};

function trackBot(bot) {
    _bots[bot.config.token] = bot;
}

controller.on('slash_command', function(bot, message) {

    var user_input = message.text.split(/\ /);

    /* Create a new personal profile */
    if (message.command == '/create') {
        userCmd.create(controller, bot, message);
    }
    else if (message.command == '/show') {
    	userCmd.show(controller, bot, message);
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
controller.storage.teams.all(function(err, teams) {

    if (err) {
        throw new Error(err);
    }

    // connect all teams with bots up to slack!
    for (var t in teams) {
        if (teams[t].bot) {
            controller.spawn(teams[t]).startRTM(function(err, bot) {
                if (err) {
                    console.log('Error connecting bot to Slack:', err);
                } else {
                    trackBot(bot);
                }
            });
        }
    }

});

controller.on('create_bot', function(bot, config) {

    if (_bots[bot.config.token]) {
        // already online! do nothing.
    } else {
        bot.startRTM(function(err) {

            if (!err) {
                trackBot(bot);
            }

            bot.startPrivateConversation({ user: config.createdBy }, function(err, convo) {
                if (err) {
                    console.log(err);
                } else {
                    convo.say('I am a bot that has just joined your team');
                    convo.say('You must now /invite me to a channel so that I can be of use!');
                }
            });

        });
    }

});


// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function(bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function(bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});