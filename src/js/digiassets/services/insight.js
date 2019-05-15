'use strict';


angular.module('copayAddon.digiAssets').factory('insight', function ($http, profileService) {

  function Insight(opts) {
    this.network = opts.network || 'livenet';
    this.url = opts.url;
  }

  Insight.prototype.getTransaction = function(txid, cb) {
    var url = this.url + '/api/tx/' + txid;

    $http.get(url)
        .success(function (data, status) {
          if (status != 200) return cb(data);
          return cb(null, data);
        })
        .error(function (data, status) {
          return cb(data);
        });
  };

  var testnetInsight = new Insight({ network: 'testnet', url: 'https://test-insight.bitpay.com' });

  var livenetInsight = new Insight({ network: 'livenet', url: 'https://digiexplorer.info' });

  return {
    get: function() {
      return livenetInsight;
    }
  };
});