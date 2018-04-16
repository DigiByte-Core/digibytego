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
  public wallets: any;

  constructor(
    private events: Events,
    private logger: Logger,
    private digiidProvider: DigiIDProvider,
    private persistenceProvider: PersistenceProvider,
    private profileProvider: ProfileProvider
  ) {
    this.shifts = { data: {} };
    this.wallets = this.profileProvider.getWallets();
    this.persistenceProvider.getDigiIdHistory(this.wallets[0].id)
     .then(history => {
       console.log(history);
       this.history = history;
     });
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad DigiID Page');
    // this.digiidProvider.setAddress('digiid://digiid.digibyteprojects.com/callback?x=fd40d7a087105eeb');
    //this.digiidProvider.signMessage()
    //  .then(msg => this.digiidProvider.authorize(msg));
  }

}
