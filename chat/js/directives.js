app.directive('messages', function () {
    return {
        restrict: "E",
        templateUrl: "templates/messages.html",
        scope: {
            content: "="
        },
        controller: ["$scope", function ($scope) {

        }]
    };
});

app.directive('message', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/message.html',
        scope: {
            text: '@'
        }
    }
});