var app = angular.module('BotkitChatApp', ['ngMaterial', 'ui.router', 'ngMdIcons', 'ngTextareaEnter']);
app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/add-bot');
    $stateProvider
        .state('addBot', {
            url: '/add-bot',
            templateUrl: 'templates/add-bot.html',
            title: 'Add a new Bot',
            controller: 'AddBotCtrl'
        })
        .state('chat', {
            url: '/chat/:id',
            templateUrl: 'templates/chat.html',
            title: 'Chat',
            controller: 'ChatCtrl'
        });
});
app.run(['$rootScope', '$window', function ($rootScope, $window) {
    $rootScope.$on('$stateChangeSuccess', function (event, current) {
        $window.document.title = current.title;
    });
}]);
