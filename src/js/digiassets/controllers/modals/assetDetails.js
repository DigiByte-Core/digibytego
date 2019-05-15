'use strict';

angular.module('copayAddon.digiAssets')
    .controller('assetDetailsController', function (
      $rootScope,
      $scope,
      $ionicModal,
      externalLinkService,
      insight
    ) {

  $scope.color = '0066cc';

  insight = insight.get();
  insight.getTransaction($scope.asset.issuanceTxid, function (err, tx) {
    if (!err) {
      $scope.issuanceTx = tx;
    }
  });

  $rootScope.$on('digiAssets/TxComplete', function() {
    $scope.cancel();
  });

  $scope.openTransferModal = function () {
    $ionicModal.fromTemplateUrl('views/digiassets/modals/send.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.assetTransferModal = modal;
      $scope.assetTransferModal.show();
    });
  };

  $scope.openBlockExplorer = function () {
    var url = 'https://digiexplorer.info/';
    var networkSuffix = '';
    //$rootScope.openExternalLink(url + networkSuffix + 'tx/' + $scope.asset.issuanceTxid);
    externalLinkService.open(url + networkSuffix + 'tx/' + $scope.asset.issuanceTxid);
  };

  $scope.cancel = function () {
    $scope.assetDetailsModal.hide();
  };


});