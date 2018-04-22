import { Component } from '@angular/core';
import { Events, ModalController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';

// Providers
import { PersistenceProvider } from '../../../../providers/persistence/persistence';
import { ProfileProvider } from '../../../../providers/profile/profile';
import { DigiIDProvider } from '../../../../providers/digiid/digiid';

// Pages
import { DigiidPage } from '../digiid';
import { DigiidFailurePage } from '../digiid-failure/digiid-failure';
import { DigiidSuccessPage } from '../digiid-success/digiid-success';

@Component({
  selector: 'page-digiid-confirm',
  templateUrl: 'digiid-confirm.html',
})
export class DigiidConfirmPage {

  public address: string;
  public confirmText: string;
  public isOpenSelector: boolean;
  public uri: string;
  public wallet: any;
  public wallets: any;

  constructor(
    private digiidProvider: DigiIDProvider,
    private events: Events,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private persistenceProvider: PersistenceProvider,
    private profileProvider: ProfileProvider,
  ) {
    this.isOpenSelector = false;
    this.confirmText = 'Slide to confirm';
  }

  ionViewWillEnter() {
    this.wallets = this.profileProvider.getWallets();
    this.onWalletSelect(this.checkSelectedWallet(this.wallet, this.wallets));
    this.digiidProvider.setup(this.navParams.data.uri, this.wallet);
    this.address = this.digiidProvider.getSiteAddress();
  }

  private onWalletSelect(wallet: any): any {
    this.wallet = wallet;
  }

  private checkSelectedWallet(wallet: any, wallets: any): any {
    if (!wallet) return wallets[0];
    let w = _.find(wallets, (w: any) => {
      return w.id == wallet.id;
    });
    if (!w) return wallets[0];
    return wallet;
  }

  public showWallets(): void {
    this.isOpenSelector = true;
    let id = this.wallet ? this.wallet.credentials.walletId : null;
    this.events.publish('showWalletsSelectorEvent', this.wallets, id);
    this.events.subscribe('selectWalletEvent', (wallet: any) => {
      if (!_.isEmpty(wallet)) this.onWalletSelect(wallet);
      this.events.unsubscribe('selectWalletEvent');
      this.isOpenSelector = false;
    });
  }

  public approve() {
    return new Promise((resolve, reject) => {
      this.digiidProvider.signMessage()
        .then(msg => this.digiidProvider.authorize(msg))
        .then(localHistory => {
          return this.persistenceProvider.setDigiIdHistory(this.wallet.id, localHistory)
        })
        .then(() => {
          let modal = this.modalCtrl.create(DigiidSuccessPage, { }, { showBackdrop: true, enableBackdropDismiss: false });
          modal.present();
          modal.onDidDismiss(() => {
            this.navCtrl.push(DigiidPage);
          });
        })
      .catch(err => {
        return this.persistenceProvider.setDigiIdHistory(this.wallet.id, err.localHistory)
        .then(() => {
          let modal = this.modalCtrl.create(DigiidFailurePage, { error: err.error }, { showBackdrop: true, enableBackdropDismiss: false });
          modal.present();
          modal.onDidDismiss(() => {
            this.navCtrl.push(DigiidPage);
          }); 
        });
      });
    });
  }

}
