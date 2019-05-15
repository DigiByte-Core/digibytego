'use strict';

angular.module('copayAddon.digiAssets').config(function ($provide) {

  $provide.decorator('availableBalanceDirective', function($delegate) {
    var directive = $delegate[0];
    directive.controller = function($rootScope, $scope, profileService, configService, lodash) {
      var config = configService.getSync().wallet.settings;
      $rootScope.$on('digiAssets/AssetsUpdated', function(event, assets) {
        var assetsBalanceSat = lodash.reduce(assets, function(total, asset) {
          total += asset.utxo.value;
          return total;
        }, 0);

        var availableBalanceSat = $scope.index.availableBalanceSat - assetsBalanceSat;
        $scope.availableBalanceStr = profileService.formatAmount(availableBalanceSat) + ' ' + config.unitName;
        $scope.assetsBalanceStr = profileService.formatAmount(assetsBalanceSat) + ' ' + config.unitName;
      });
    };
    directive.templateUrl = 'digiassets/views/includes/available-balance.html';
    return $delegate;
  });

});