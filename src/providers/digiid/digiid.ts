import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { resolve } from 'path';
import * as encoding from 'text-encoding';
import { Logger } from '../../providers/logger/logger';

// providers
import { BwcProvider } from '../../providers/bwc/bwc';
import { AppProvider } from '../app/app';
import { ConfigProvider } from '../config/config';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { PersistenceProvider } from '../persistence/persistence';
import { ProfileProvider } from '../profile/profile';

@Injectable()
export class DigiIDProvider {

  private bitcore: any;
  private _parsed: any;
  private _address: any;
  private MAGIC_BYTES: any;
  private credentials: any;

  constructor(
    private appProvider: AppProvider,
    private bwcProvider: BwcProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private http: HttpClient,
    private logger: Logger,
    private configProvider: ConfigProvider,
    private profileProvider: ProfileProvider,
    private persistenceProvider: PersistenceProvider
  ) {
    this.bitcore = this.bwcProvider.getBitcore();
    this.logger.info('Hello DigiID Provider');
    this._parsed = {};
    this._address = '';
    this.MAGIC_BYTES = this.bitcore.deps.Buffer('DigiByte Signed Message:\n');
  }

  private _getFullCallbackURI() {
    return this._getParsed().href;
  }

  private _getMessageToSign() {
    return this._getFullCallbackURI();
  }

  private _getCallBackURL() {
    return this.getSiteAddress() + this._getParsed().pathname;
  }

  private _getParsed() {
    if(this._parsed == '') {
      this._parseURI();
    }
    return this._parsed;
  }

  private _parseURI() {
    const reURLInformation = new RegExp([
      '^(digiid)://', // protocol
      '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
      '(/[^?#]*)', // pathname
      '.x=([^\\&u=]*|)', // NONCE
      '.(u=[^#]*|)' // IS UNSECURE
    ].join(''));
    const match = this._address.match(reURLInformation);
    this._parsed = match && {
      href: this._address,
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      nonce: match[6],
      unsecure: match[7]
    };
  }

  private _createMessage(signature, pubKey) {
    const message = {
      signature,
      uri: this._getFullCallbackURI(),
      address: pubKey
    };
    return message;
  }

  private _sign(message, privateKey) {
    const hash = this.magicHash(message);
    const ecdsa = new this.bitcore.crypto.ECDSA();
    ecdsa.hashbuf = hash;
    ecdsa.privkey = privateKey;
    ecdsa.pubkey = privateKey.toPublicKey();
    ecdsa.signRandomK();
    ecdsa.calci();
    return ecdsa.sig;
  }

  public setAddress(href): void {
    this._address = href;
    this._parseURI();
  }

  public getDigIDSiteURI(): string {
    return this._parsed.protocol + ":" + this._parsed.host + this._parsed.pathname;
  }

  public getSiteAddress(): string {
    const protocol = (this._parsed.unsecure != '') ? 'http://' : 'https://';
    return protocol + this._parsed.host;
  }

  public generateSignatureMessage(hdPrivateKey): Promise<object> {
    return new Promise((resolve, reject) => {
    const messageBuffer = new this.bitcore.deps.Buffer(this.getDigIDSiteURI());
    const sha256URL = this.bitcore.crypto.Hash.sha256(messageBuffer);
    const buffer = new encoding.TextEncoder("utf-8").encode(this.getDigIDSiteURI());
      crypto.subtle.digest("SHA-256", buffer)
        .then((buf: any) => {
          const sha32uri = sha256URL.readInt32LE(1);
          const derived = hdPrivateKey.derive("m/" + sha32uri + "/0");
      
          const message = this._getMessageToSign();
      
          const signedMessage = this.sign(message, derived.privateKey);
      
          const pubKeyAddress = derived.privateKey.toAddress();
          const fullMessage = this._createMessage(signedMessage, pubKeyAddress.toString());
          return resolve(fullMessage);
      });
    });
  }

  public magicHash(message): Buffer {
    const prefix1 = this.bitcore.encoding.BufferWriter.varintBufNum(this.MAGIC_BYTES.length);
    const messageBuffer = new this.bitcore.deps.Buffer(message);
    const prefix2 = this.bitcore.encoding.BufferWriter.varintBufNum(messageBuffer.length);
    const buf = this.bitcore.deps.Buffer.concat([prefix1, this.MAGIC_BYTES, prefix2, messageBuffer]);
    const hash = this.bitcore.crypto.Hash.sha256sha256(buf);
    return hash;
  }

  public sign(message, privateKey): string {
    const signature = this._sign(message, privateKey);
    return signature.toCompact().toString('base64');
  }

  public signMessage(): Promise<object> {
    return new Promise((resolve, reject) => {
      const wallets = this.profileProvider.getWallets();
      const xpriv = wallets[0].credentials.xPrivKey;
      var hdPrivateKey = this.bitcore.HDPrivateKey(xpriv);
      this.generateSignatureMessage(hdPrivateKey)
        .then(msg => {
          return resolve(msg);
        });
      });
  }

  public authorize(msg): Promise<void> {
    return new Promise((resolve, reject) => {
      let localHistory;
      const obj = {
        uri: msg.uri,
        host: this._parsed.host,
        address: msg.address,
        success: false,
        time: Math.floor(Date.now() / 1000)
      };
      const wallets = this.profileProvider.getWallets();
      this.persistenceProvider.getDigiIdHistory(wallets[0].id)
        .then((history: any) => {
          localHistory = history || [];
          return this.http.post(this._getCallBackURL(), msg)
        })
        .then(values => {
          obj.success = true;
          localHistory.unshift(obj);
          this.logger.info("SUCCESS: Feedback sent");
          return this.persistenceProvider.setDigiIdHistory(wallets[0].id, localHistory);
        })
        .catch(err => {
          localHistory.unshift(obj);
          this.logger.info("ERROR: Feedback sent anyway.");
          return this.persistenceProvider.setDigiIdHistory(wallets[0].id, localHistory).then(() => reject());
        });
    });
  }

  public register(): void {
    this.homeIntegrationsProvider.register({
      name: 'digiid',
      title: 'DigiID',
      icon: 'assets/img/icon-digiid.svg',
      page: 'DigiidPage',
      show: true
    });
  }

}