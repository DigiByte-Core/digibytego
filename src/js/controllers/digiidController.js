'use strict';

angular.module('copayApp.controllers').controller('digiidController', function($scope, $http, $stateParams, $state, digiidService, storageService) {
  $scope.uri = $stateParams.uri;
  $scope.address = $stateParams.address;

  storageService.getDigiIDHistory(function(err, history) {
    $scope.history = JSON.parse(history);
  });

  $scope.uri = 'digiid://digiid.digibyteprojects.com/callback?x=e71bfd394a0ddda0';

  $scope.init = function() {
    digiidService.setAddress($scope.uri);
    digiidService.signMessage($scope.uri, function(err, msg) {
      digiidService.authorize(msg);
    });
  }

}); 