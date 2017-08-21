var restify = require('restify');
var socketio = require('socket.io');
var MongoClient = require('mongodb-bluebird');
var request = require('request');
var config = require('./config.json');

var botsCollection, messagesCollection;
MongoClient.connect('mongodb://localhost:27017/BotkitChat').then(function (db) {
    botsCollection = db.collection('bots');
    messagesCollection = db.collection('messages');
});

function generateId() {
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++) id += possible.charAt(Math.floor(Math.random() * possible.length));
    return id;
}

function getMessageObject(botId, text) {
    return {
        object: 'page',
        entry: [{
            id: botId,
            time: getTimestamp(),
            messaging: [{
                sender: {
                    id: 'me'
                },
                recipient: {
                    id: botId
                },
                timestamp: getTimestamp(),
                message: {
                    mid: 'mid.$cAADVUUk_WKpj9zjtb1dxfOhXb-kp',
                    seq: 2626475,
                    text,
                    nlp: []
                }
            }]
        }]
    };
}

function getTimestamp() {
    return (new Date).getTime();
}

var server = restify.createServer({
    formatters: {
        'text/html': function (req, res, body) { // 'catch-all' formatter
            if (body instanceof Error) { // see text
                body = JSON.stringify({
                    code: body.body.code,
                    message: body.body.message
                });
            };
            return body;
        }
    }
});

var io = socketio.listen(server.server);
var clients = {};

io.on('connection', function (client) {
    clients['me'] = client;
    client.on('app:start', function () {
        botsCollection.find({}, {
            name: 1
        }, {
            sort: ['lastUpdated', 'desc']
        }).then(function (bots) {
            bots.forEach(function (bot) {
                bot.id = bot._id.toString();
                delete bot._id;
            });
            client.emit('bots:populate', bots);
        });
    });
    client.on('chat:enter', function (chat) {
        messagesCollection.find({
            chatId: chat.id
        }, {}, {
            sort: ['timestamp', 'desc']
        }).then(function (messages) {
            client.emit('chat:populate', messages);
        });
    });
    client.on('bot:create', function (bot) {
        botsCollection.findOne({
            accessToken: bot.accessToken
        }).then(function (result) {
            if (!result) {
                bot.lastUpdated = getTimestamp();
                botsCollection.insert(bot).then(function (result) {
                    bot.id = result.insertedIds[0];
                    delete bot.lastUpdated;
                    delete bot.verifyToken;
                    delete bot.accessToken;
                    delete bot.webhook;
                    client.emit('bot:create', bot);
                });
            }
        });
    });
    client.on('chat:message', function (message) {
        botsCollection.findOne({
            _id: message.chatId
        }).then(function (bot) {
            request.post(bot.webhook, {
                form: getMessageObject(bot._id.toString(), message.text)
            });
        });
        message.timestamp = getTimestamp();
        messagesCollection.insert(message);
        client.emit('chat:message', message);
    });
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(function (req, res, next) {
    res.setHeader('Cache-Control', 'public, max-age=0');
    next();
});


server.pre(function (request, response, next) {
    console.log(request.url);
    next();
});

server.post('/me/subscribed_apps', function (req, res, next) {
    res.send('{success: true}');
    next();
});

server.post('/v2.6/me/messages', function (req, res, next) {
    botsCollection.findOne({
        accessToken: req.body.access_token
    }).then(function (bot) {
        var message = {
            chatId: bot._id.toString(),
            sender: bot._id.toString(),
            text: req.body.message.text,
            timestamp: getTimestamp()
        };
        messagesCollection.insert(message);
        clients['me'].emit('chat:message', message);
    });
    next();
});

server.get(/\/chat\/?.*/, restify.plugins.serveStatic({
    directory: __dirname
}));

server.listen(config.port, function () {
    console.log('%s listening at %s', server.name, server.url);
});
