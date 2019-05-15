'use strict';

var AssetIssueController = function ($stateParams, $rootScope, $scope, $timeout, $log, digiAssets, gettext,
  profileService, lodash, bitcore, txStatus, daConfig,
  daFeeService, configService, walletService, txFormatService,
  ongoingProcess, $ionicModal) {

  ProcessingTxController.call(this, $rootScope, $scope, $timeout, $log, digiAssets, gettext, profileService,
      lodash, bitcore, txStatus, walletService, configService, txFormatService, ongoingProcess, $ionicModal);

  var self = this;

  $scope.issuance = {
    userData: []
  };

  $scope.estimatedCost = '...';

  daFeeService.estimateCostOfIssuance(profileService.getWallet($stateParams.walletId), function(err, fee, totalCost) {
    if (err) {
      return self._handleError(err);
    }
    var config = configService.getSync().wallet.settings;
    $scope.estimatedCost = txFormatService.formatAmount(totalCost) + ' ' + config.unitName;
    $timeout(function() {
      $scope.$digest();
    });
  });

  $scope.addField = function() {
    $scope.issuance.userData.push({ key: '', value: '', type: 'String' });
  };

  $scope.removeField = function(field) {
    lodash.pull($scope.issuance.userData, field);
  };

  $scope.cancel = function () {
    self.setOngoingProcess();
    ongoingProcess.clear();
    $scope.issueAssetModal.hide();
  };

  var createAsset = function(issuance, iconData) {
    self.setOngoingProcess(gettext('Creating issuance transaction'));
    var wallet = profileService.getWallet($stateParams.walletId);
    digiAssets.createIssueTx(issuance, wallet, function (err, result) {
      if (err) {
        return self._handleError(err);
      }

      var customData = {
        asset: {
          action: 'issue',
          assetName: issuance.assetName,
          icon: 'https://raw.githubusercontent.com/DigiByte-Core/digibyte-logos/master/DigiAsset%20Icons/gear.png',
          amount: issuance.amount
        }
      };
      self._createAndExecuteProposal(wallet, result.txHex, result.issuanceUtxo.address, customData);
    });
  };

  $scope.issueAsset = function (form) {
    if (form.$invalid) {
      this.error = gettext('Unable to send transaction proposal');
      return;
    }
    var wallet = profileService.getWallet($stateParams.walletId);
    if (wallet.isPrivKeyEncrypted()) {
      profileService.unlockFC(function (err) {
        if (err) return self._setError(err);
        return $scope.issueAsset(form);
      });
      return;
    }

    if (this.file) {
      //(this.issuance, this.file);
    } else {
      createAsset(this.issuance);
    }
  };
};

AssetIssueController.prototype = Object.create(ProcessingTxController.prototype);

angular.module('copayAddon.digiAssets').controller('assetIssueController', AssetIssueController);