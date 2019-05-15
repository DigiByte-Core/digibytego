    
'use strict';

angular.module('copayApp.controllers').controller('topbarController', function($state) { 

  this.goHome = function() {
    $state.go('tabs.home');
  };

  this.goPreferences = function() {
    $state.go('tabs.settings');
  };

});