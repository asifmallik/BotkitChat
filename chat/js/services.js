app.factory('Socket', function ($rootScope) {
    var socket = io();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, callback);
        },
        onMultiple: function (listeners) {
            for (var eventName in listeners) {
                if (listeners.hasOwnProperty(eventName)) {
                    this.on(eventName, listeners[eventName]);
                }
            }
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        },
        removeAllListeners: function () {
            socket.removeAllListeners();
        },
        off: function (listeners) {
            for (var eventName in listeners) {
                if (listeners.hasOwnProperty(eventName)) {
                    socket.off(eventName, listeners[eventName]);
                }
            }
        }
    };
});

app.factory('Backend', ['Socket', '$rootScope', function (Socket, $rootScope) {
    var bots = [];
    var chats = {};

    var appendMessage = function (message) {
        var chat = chats[message.chatId];
        if (chat.length == 0) {
            chat.push({
                messages: [message],
                sender: message.sender
            });
        } else {
            var lastMessages = chat[chat.length - 1];
            if (lastMessages.sender == message.sender) {
                lastMessages.messages.push(message);
            } else {
                chat.push({
                    messages: [message],
                    sender: message.sender
                });
            }
        }
        delete message.chatId;
        delete message.sender;
        $rootScope.$apply();
    };

    Socket.on('bot:create', function (bot) {
        bots.unshift(bot);
        chats[bot.id] = [];
    });

    Socket.on('bots:populate', function (botsFromServer) {
        botsFromServer.forEach(function (bot) {
            if (!chats[bot.id]) chats[bot.id] = [];
            bots.push(bot);
        });
    });

    Socket.on('chat:populate', function (messages) {
        for (var i = 0; i < messages.length; i++) appendMessage(messages[i]);
    });

    Socket.on('chat:message', appendMessage);

    Socket.emit('app:start');

    return {
        getBots: function () {
            return bots;
        },
        getChat: function (id) {
            Socket.emit('chat:enter', {
                id: id
            });
            if (!chats[id]) chats[id] = [];
            return chats[id];
        }
    }
}]);
