'use strict';


angular.module('copayAddon.digiAssets')
    .service('daFeeService', function (profileService, feeService, $log) {
      var SATOSHIS_FOR_ISSUANCE_COLORING = 1300,
          SATOSHIS_FOR_TRANSFER_COLORING = 600,
          root = {};

      // from BWS TxProposal.prototype.getEstimatedSize
      var _getEstimatedSize = function(wallet, nbInputs, nbOutputs) {

        var credentials = wallet.credentials;
        // Note: found empirically based on all multisig P2SH inputs and within m & n allowed limits.
        var safetyMargin = 0.05;
        var walletM = credentials.m;

        var overhead = 4 + 4 + 9 + 9;
        var inputSize = walletM * 72 + credentials.n * 36 + 44;
        var outputSize = 34;
        nbOutputs = nbOutputs + 1;

        var size = overhead + inputSize * nbInputs + outputSize * nbOutputs;

        return parseInt((size * (1 + safetyMargin)).toFixed(0));
      };

      root.estimateFee = function(wallet, nbInputs, nbOutputs, cb) {
          var feePerKb = 50000;
          var size = _getEstimatedSize(wallet, nbInputs, nbOutputs);
          $log.debug("Estimated size: " + size);
          var fee = feePerKb * size / 1000;
          fee = fee < 1000 ? 1000 : fee; 
          fee = parseInt(fee.toFixed(0));
          $log.debug("Estimated fee: " + fee);
          return cb(null, fee);
      };

      root.estimateCostOfIssuance = function(wallet, cb) {
        var nInputs = 1; // issuing address
        var nOutputs = 3; // outputs for issuance coloring scheme

        root.estimateFee(wallet, nInputs, nOutputs, function(err, fee) {
          var amount = fee + SATOSHIS_FOR_ISSUANCE_COLORING;
          $log.debug("Estimated cost of issuance: " + amount);
          return cb(err, fee, amount);
        });
      };

      root.estimateCostOfTransfer = function(transferUnits, totalUnits, wallet, cb) {
        var hasChange = transferUnits < totalUnits;

        var nInputs = 2; // asset address + finance utxo
        // 2 outputs if spending without change: colored UTXO + OP_RETURN
        // 3 outputs if spending with change: colored UTXO + OP_RETURN + colored UTXO with change
        var nOutputs = hasChange ? 3 : 2;

        root.estimateFee(wallet, nInputs, nOutputs, function(err, fee) {
          // We need extra satoshis if we have change transfer, these will go to change UTXO
          var amount = hasChange ? fee + SATOSHIS_FOR_TRANSFER_COLORING : fee;
          $log.debug("Estimated cost of transfer: " + amount);
          return cb(err, fee, amount);
        });
      };

      return root;
    });