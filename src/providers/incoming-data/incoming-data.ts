import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { App, Events, NavControllerBase } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

// providers
import { AppProvider } from '../app/app';
import { BwcProvider } from '../bwc/bwc';
import { DigiIDProvider } from '../digiid/digiid';
import { PayproProvider } from '../paypro/paypro';
import { PopupProvider } from '../popup/popup';
import { ScanProvider } from '../scan/scan';

// pages
import { ImportWalletPage } from '../../pages/add/import-wallet/import-wallet';
import { JoinWalletPage } from '../../pages/add/join-wallet/join-wallet';
import { AmountPage } from '../../pages/send/amount/amount';
import { ConfirmPage } from '../../pages/send/confirm/confirm';

@Injectable()
export class IncomingDataProvider {
  private navCtrl: NavControllerBase;
  constructor(
    private app: App,
    private events: Events,
    private bwcProvider: BwcProvider,
    private digiidProvider: DigiIDProvider,
    private payproProvider: PayproProvider,
    private scanProvider: ScanProvider,
    private popupProvider: PopupProvider,
    private logger: Logger,
    private appProvider: AppProvider,
    private translate: TranslateService
  ) {
    this.logger.info('IncomingDataProvider initialized.');
  }

  public showMenu(data: any): void {
    this.events.publish('showIncomingDataMenuEvent', data);
  }

  public redir(data: string): boolean {
    // TODO Injecting NavController in constructor of service fails with no provider error
    this.navCtrl = this.app.getActiveNav();


    data = this.sanitizeUri(data);
    let amount: string;
    let message: string;
    let addr: string;
    let parsed: any;

    // Bitcoin  URL
    if (this.bwcProvider.getBitcore().URI.isValid(data)) {
      this.logger.debug('Handling DigiByte URI');
      parsed = this.bwcProvider.getBitcore().URI(data);
      addr = parsed.address ? parsed.address.toString() : '';
      message = parsed.message;
      amount = parsed.amount ? parsed.amount : '';

      if (parsed.r) {
        this.payproProvider.getPayProDetails(parsed.r).then((details) => {
          this.handlePayPro(details);
        }).catch((err: string) => {
          if (addr && amount) this.goSend(addr, amount, message);
          else this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
        });
      } else {
        this.goSend(addr, amount, message);
      }
      return true;
    } else if (/^https?:\/\//.test(data)) {
      // Plain URL
      this.logger.debug('Handling Plain URL');

      this.payproProvider.getPayProDetails(data).then((details) => {
        this.handlePayPro(details);
        return true;
      }).catch(() => {
        this.showMenu({
          data,
          type: 'url'
        });
        return;
      });
      // Plain Address
    } else if (this.bwcProvider.getBitcore().Address.isValid(data, 'livenet') || this.bwcProvider.getBitcore().Address.isValid(data, 'testnet')) {
      this.logger.debug('Handling DigiByte Plain Address');
      if (this.navCtrl.getActive().name === 'ScanPage') {
        this.showMenu({
          data,
          type: 'bitcoinAddress',
        });
      } else {
        this.goToAmountPage(data);
      }
    } else if (/^digiid?:\/\//.test(data)) {
      this.digiidProvider.setAddress(data);
      this.digiidProvider.signMessage()
      .then(msg => this.digiidProvider.authorize(msg));
    } else if (data && data.indexOf(this.appProvider.info.name + '://') === 0) {

      // Disable BitPay Card
      if (!this.appProvider.info._enabledExtensions.debitcard) return false;

      // For BitPay card binding
      let secret = this.getParameterByName('secret', data);
      let email = this.getParameterByName('email', data);
      let otp = this.getParameterByName('otp', data);
      let reason = this.getParameterByName('r', data);
      switch (reason) {
        default:
        case '0':
          /* For BitPay card binding */
          // this.navCtrl.push(BitPayCardIntroPage, { secret, email, otp });
          break;
      }
      return true;

      // Join
    } else if (data && data.match(/^digibytego:[0-9A-HJ-NP-Za-km-z]{70,80}$/)) {
      this.navCtrl.push(JoinWalletPage, { url: data, fromScan: true })
      return true;
      // Old join
    } else if (data && data.match(/^[0-9A-HJ-NP-Za-km-z]{70,80}$/)) {
      this.navCtrl.push(JoinWalletPage, { url: data, fromScan: true })
      return true;
    } else if (data && (data.substring(0, 2) == '6P' || this.checkPrivateKey(data))) {
      this.logger.debug('Handling private key');
      this.showMenu({
        data,
        type: 'privateKey'
      });
    } else if (data && ((data.substring(0, 2) == '1|') || (data.substring(0, 2) == '2|') || (data.substring(0, 2) == '3|'))) {
      this.navCtrl.push(ImportWalletPage, { code: data, fromScan: true })
      return true;

    } else {

      if (this.navCtrl.getActive().name === 'ScanPage') {
        this.logger.debug('Handling plain text');
        this.showMenu({
          data,
          type: 'text'
        });
      }
    }
    return false;
  }

  private sanitizeUri(data: any): string {
    // Fixes when a region uses comma to separate decimals
    let regex = /[\?\&]amount=(\d+([\,\.]\d+)?)/i;
    let match = regex.exec(data);
    if (!match || match.length === 0) {
      return data;
    }
    let value = match[0].replace(',', '.');
    let newUri = data.replace(regex, value);

    // mobile devices, uris like copay://glidera
    newUri.replace('://', ':');

    return newUri;
  }

  private getParameterByName(name: string, url: string): string {
    if (!url) return;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  private checkPrivateKey(privateKey: string): boolean {
    try {
      this.bwcProvider.getBitcore().PrivateKey(privateKey, 'livenet');
    } catch (err) {
      return false;
    }
    return true;
  }

  private goSend(addr: string, amount: string, message: string): void {
    if (amount) {
      this.navCtrl.push(ConfirmPage, {
        amount,
        toAddress: addr,
        description: message,
      });
    } else {
      this.navCtrl.push(AmountPage, {
        toAddress: addr
      });
    }
  }

  private goToAmountPage(toAddress: string) {
    this.navCtrl.push(AmountPage, {
      toAddress
    });
  }

  private handlePayPro(payProDetails: any): void {
    let stateParams: any = {
      amount: payProDetails.amount,
      toAddress: payProDetails.toAddress,
      description: payProDetails.memo,
      paypro: payProDetails
    };
    // fee
    if (payProDetails.requiredFeeRate) {
      stateParams.requiredFeeRate = Math.ceil(payProDetails.requiredFeeRate * 1024);
    }
    this.scanProvider.pausePreview();
    this.navCtrl.push(ConfirmPage, stateParams);
  }

}
