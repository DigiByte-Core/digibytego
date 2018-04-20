import { Component } from '@angular/core';
import { Events, ModalController, NavController } from 'ionic-angular';
import * as _ from 'lodash';
import { Logger } from '../../../providers/logger/logger';

import { DigiIDProvider } from '../../../providers/digiid/digiid';


@Component({
  selector: 'page-digiid',
  templateUrl: 'digiid.html',
})
export class DigiidPage {

  public shifts: any;
  public network: string;

  constructor(
    private events: Events,
    private logger: Logger,
    private digiidProvider: DigiIDProvider
  ) {
    this.shifts = { data: {} };
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad DigiID Page');
    this.digiidProvider.setAddress('digiid://digiid.digibyteprojects.com/callback?x=fd40d7a087105eeb');
    this.digiidProvider.signMessage()
      .then(msg => this.digiidProvider.authorize(msg));
  }

}
