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

module.exports = {generateId, getMessageObject, getTimestamp};
