'use strict';

angular.module('copayAddon.digiAssets').config(function ($provide) {

  $provide.decorator('txStatus', function($delegate) {
    var defaultTemplateUrl = $delegate._templateUrl;
    $delegate._templateUrl = function(type, txp) {
      if (txp.customData && txp.customData.asset) {
        return txp.customData.asset.action == 'transfer'
            ? 'digiassets/views/modals/transfer-status.html'
            : 'digiassets/views/modals/issue-status.html';
      }
      return defaultTemplateUrl(type, txp);
    };
    return $delegate;
  });
});