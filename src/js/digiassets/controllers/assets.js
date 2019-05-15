'use strict';

angular.module('copayAddon.digiAssets')
    .controller('assetsController', function (
      $rootScope,
      $scope,
      $timeout,
      $ionicModal,
      $stateParams,
      platformInfo,
      profileService,
      digiAssets
    ) {

      $scope.assets = digiAssets.assets;
      $scope.error = digiAssets.error;

      var disableAssetListener = $rootScope.$on('digiAssets/AssetsUpdated', function (event, assets) {
        $scope.assets = assets;
      });

      var disableErrorListener = $rootScope.$on('digiAssets/Error', function (event, errorMsg) {
        $scope.error = errorMsg;
      });

      var disableOngoingProcessListener = $rootScope.$on('Addon/OngoingProcess', function(e, name) {
        $scope.setOngoingProcess(name);
      });

      $scope.$on('$destroy', function () {
        disableAssetListener();
        disableOngoingProcessListener();
        disableErrorListener();
      });

      $scope.getAssets = function() {
        digiAssets.getAssets(profileService.getWallet($stateParams.walletId));
      }

      $scope.setOngoingProcess = function(name) {
        self.blockUx = !!name;

        if (platformInfo.isCordova) {
          if (name) {
            window.plugins.spinnerDialog.hide();
            window.plugins.spinnerDialog.show(null, name + '...', true);
          } else {
            window.plugins.spinnerDialog.hide();
          }
        } else {
          $scope.onGoingProcess = name;
          $timeout(function() {
            $rootScope.$apply();
          });
        }
      };

      // show ongoing process if any
      $scope.setOngoingProcess(digiAssets.onGoingProcess);

      $scope.openAssetModal = function (asset) {
        $scope.asset = asset;
        $ionicModal.fromTemplateUrl('views/digiassets/modals/asset-details.html', {
          scope: $scope
        }).then(function(modal) {
          $scope.assetDetailsModal = modal;
          $scope.assetDetailsModal.show();
        });
      };

      $scope.openIssueModal = function () {
        $ionicModal.fromTemplateUrl('views/digiassets/modals/issue.html', {
          scope: $scope
        }).then(function(modal) {
          $timeout(function() {
            $scope.issueAssetModal = modal;
            $scope.issueAssetModal.show();
          });
        });
      };
    });