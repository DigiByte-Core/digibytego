import { Component } from '@angular/core';
import { Events, ModalController, NavController } from 'ionic-angular';
import * as _ from 'lodash';
import { Logger } from '../../../providers/logger/logger';

import { DigiIDProvider } from '../../../providers/digiid/digiid';
import { PersistenceProvider } from '../../../providers/persistence/persistence';
import { ProfileProvider } from '../../../providers/profile/profile';


@Component({
  selector: 'page-digiid',
  templateUrl: 'digiid.html',
})
export class DigiidPage {

  public shifts: any;
  public history: any;
  public wallet: any;
  public wallets: any;
  public address: string;
  public isOpenSelector: boolean;

  constructor(
    private events: Events,
    private logger: Logger,
    private digiidProvider: DigiIDProvider,
    private persistenceProvider: PersistenceProvider,
    private profileProvider: ProfileProvider
  ) {
    this.isOpenSelector = false;
  }

  ionViewWillEnter() {
    this.wallets = this.profileProvider.getWallets();
    this.onWalletSelect(this.checkSelectedWallet(this.wallet, this.wallets));
    this.persistenceProvider.getDigiIdHistory(this.wallet.id)
     .then(history => {
       this.history = history;
     });
  }

  private onWalletSelect(wallet: any): any {
    this.wallet = wallet;
    this.persistenceProvider.getDigiIdHistory(this.wallet.id)
     .then(history => {
       this.history = history;
     });
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
}