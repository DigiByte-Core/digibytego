import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// Providers
import { DigiIDProvider } from '../../../../providers/digiid/digiid';

@Component({
  selector: 'page-digiid-details',
  templateUrl: 'digiid-details.html',
})
export class DigiidDetailsPage {
  public walletId: string;
  public authDetails: any;
  public title: string;
  public uri: any;

  constructor(
    private digiidProvider: DigiIDProvider,
    private navCtrl: NavController,
    private navParams: NavParams,
  ) {
  }

  ionViewWillEnter() {
    this.walletId = this.navParams.data.walletId;
    this.authDetails = this.navParams.data.authDetails;
    this.title = this.authDetails.uri;
    this.uri = this.digiidProvider.passURI(this.authDetails.uri)
  }
}
