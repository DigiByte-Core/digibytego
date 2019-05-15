'use strict';

var module = angular.module('copayAddon.digiAssets', ['ngFileUpload']);

var module = angular.module('copayAddon.digiAssets', []);

angular.module('copayAddon.digiAssets')
    .value('daConfig', {
        api: {
          testnet: 'http://localhost:8000',
          livenet: 'https://api.digiassets.net'
        },
        uploadHost: 'http://localhost:8200'
      });

module
    .config(function ($stateProvider) {
      $stateProvider
          .state('assets', {
            url: '/assets/:walletId',
            templateUrl: 'views/digiassets/assets.html',
            controller: 'assetsController'
          });
    })
    .run(function (addonManager, digiAssets, $state) {
      addonManager.registerAddon({
        formatPendingTxp: function(txp) {
          if (txp.customData && txp.customData.asset) {
            var value = txp.amountStr;
            var asset = txp.customData.asset;
            txp.amountStr = asset.amount + " unit" + (asset.amount > 1 ? "s" : "") + " of " + asset.assetName;
            txp.showSingle = true;
            txp.toAddress = txp.outputs[0].toAddress; // txproposal
            txp.address = txp.outputs[0].address;     // txhistory
          }
        },
        txTemplateUrl: function() {
          return 'views/digiassets/includes/transaction.html';
        }
      });
    });