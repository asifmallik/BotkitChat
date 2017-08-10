app.controller('SettingsCtrl', ['$scope', function ($scope) {

}]);

app.controller('AddBotCtrl', ['$scope', 'Socket', function ($scope, Socket) {
    $scope.bot = {};
    $scope.addBot = function () {
        Socket.emit('bot:create', $scope.bot);
    }
}]);

app.controller('ChatCtrl', ['$scope', 'Socket', '$stateParams', 'Backend', function ($scope, Socket, $stateParams, Backend) {
    $scope.chat = Backend.getChat($stateParams.id);
    $scope.sendMessage = function () {
        Socket.emit('chat:message', {
            text: $scope.message,
            sender: 'me',
            chatId: $stateParams.id
        });
        $scope.message = "";
    };
}]);

app.controller('ParentCtrl', ['$scope', '$mdMedia', '$mdSidenav', '$state', 'Backend', function ($scope, $mdMedia, $mdSidenav, $state, Backend) {
    $scope.bots = Backend.getBots();
    $scope.user = {
        name: "Tester"
    }
    $scope.goTo = function (stateName, data) {
        $state.go(stateName, data);
    }
    $scope.toggleSidenav = function () {
        $mdSidenav("left").toggle();
    }
}]);
