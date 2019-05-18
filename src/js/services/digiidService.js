'use strict';

angular.module('copayApp.services').factory('digiidService', function($state, $stateParams, $http, bitcore, bwcService, profileService, storageService, walletService) {
  var utils = bwcService.getUtils();
  var root = {};
  var _parsed = {};
  var _address = '';
  root.MAGIC_BYTES = bitcore.deps.Buffer('DigiByte Signed Message:\n');

  var _getFullCallbackURI = function() {
    return _getParsed().href;
  };

  var _getMessageToSign = function() {
    return _getFullCallbackURI();
  };

  var _getCallBackURL = function() {
    return root.getSiteAddress() + _getParsed().pathname;
  };

  var _getParsed = function() {
    if(_parsed == '') {
      _parseURI();
    }
    return _parsed;
  };

  var _parseURI = function() {
    var reURLInformation = new RegExp([
      '^(digiid)://', // protocol
      '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
      '(/[^?#]*)', // pathname
      '.x=([^\\&u=]*|)', // NONCE
      '.(u=[^#]*|)' // IS UNSECURE
    ].join(''));
    var match = _address.match(reURLInformation);
    _parsed = match && {
      href: _address,
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      nonce: match[6],
      unsecure: match[7]
    };
  };

  var _createMessage = function(signature, pubKey) {
    var message = {
      uri: _getFullCallbackURI(),
      address: pubKey,
      signature: signature
    };
    return message;
  };

  root.setAddress = function(href) {
    _address = href;
    _parseURI();
  };

  root.getDigIDSiteURI = function() {
    return _parsed.protocol + ":" + _parsed.host + _parsed.pathname;
  };

  root.getSiteAddress = function() {
    var protocol = (_parsed.unsecure != '') ? 'http://' : 'https://';
    return protocol + _parsed.host;
  };

  root.getSiteAddress = function() {
    var protocol = (_parsed.unsecure != '') ? 'http://' : 'https://';
    return protocol + _parsed.host;
  };

  root.generateSignatureMessage = function(hdPrivateKey, cb) {
    var self = this;
    var messageBuffer = new bitcore.deps.Buffer(this.getDigIDSiteURI());
    var sha256URL = bitcore.crypto.Hash.sha256(messageBuffer);
    var buffer = new TextEncoder("utf-8").encode(this.getDigIDSiteURI());
    return crypto.subtle.digest("SHA-256", buffer)
      .then(function(buf) {
        var sha32uri = sha256URL.readInt32LE(1);
        var derived = hdPrivateKey.derive("m/" + sha32uri + "/0");
    
        var message = _getMessageToSign();
    
        var signedMessage = self.sign(message, derived.privateKey);
    
        var pubKeyAddress = derived.privateKey.toAddress();
        var fullMessage = _createMessage(signedMessage, pubKeyAddress.toString());
        return cb(null, fullMessage);
    });
  }


  root.magicHash = function magicHash(message) {
    var prefix1 = bitcore.encoding.BufferWriter.varintBufNum(this.MAGIC_BYTES.length);
    var messageBuffer = new bitcore.deps.Buffer(message);
    var prefix2 = bitcore.encoding.BufferWriter.varintBufNum(messageBuffer.length);
    var buf = bitcore.deps.Buffer.concat([prefix1, this.MAGIC_BYTES, prefix2, messageBuffer]);
    var hash = bitcore.crypto.Hash.sha256sha256(buf);
    return hash;
  };

  root._sign = function _sign(message, privateKey) {
    var hash = this.magicHash(message);
    var ecdsa = new bitcore.crypto.ECDSA();
    ecdsa.hashbuf = hash;
    ecdsa.privkey = privateKey;
    ecdsa.pubkey = privateKey.toPublicKey();
    ecdsa.signRandomK();
    ecdsa.calci();
    return ecdsa.sig;
  };

  root.sign = function sign(message, privateKey) {
    var signature = this._sign(message, privateKey);
    return signature.toCompact().toString('base64');
  };

  root.signMessage = function signMessage(message, cb) {
    var self = this;
    this.wallet = profileService.getWallet(Object.keys(profileService.wallet).map(function(key) {
      return key
    })[0]);
    this.xpriv = profileService.profile.credentials[0].xPrivKey;
    var hdPrivateKey = bitcore.HDPrivateKey(root.xpriv);
    self.generateSignatureMessage(hdPrivateKey, function(err, fullMessage) {
      return cb(null, fullMessage);
    });
  }

  root.authorize = function authorize(msg, cb) {
    storageService.getDigiIDHistory(function(err, history) {
      console.log(history);
      var localHistory = JSON.parse(history) || [];
      var obj = {
        uri: msg.uri,
        host: _parsed.host,
        address: msg.address,
        success: false,
        time: Date.now() / 1000 | 0
      };
      return $http.post(_getCallBackURL(), msg)
        .then(function(resp) {
          obj.success = true;
          localHistory.unshift(obj);
          storageService.setDigiIDHistory(JSON.stringify(localHistory), function(error) {
            $state.go('tabs.home').then(function() {
              $state.transitionTo('tabs.home.success', obj);
            });
          });
        })
        .catch(function(err) {
          localHistory.unshift(obj);
          storageService.setDigiIDHistory(JSON.stringify(localHistory), function(error) {
            obj.status = err;
            $state.go('tabs.home').then(function() {
              $state.transitionTo('tabs.home.failure', obj);
            });
          });
        });
    });
  };

  return root;
});