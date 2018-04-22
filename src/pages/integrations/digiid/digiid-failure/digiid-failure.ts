import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';

// Providers

@Component({
  selector: 'page-digiid-failure',
  templateUrl: 'digiid-failure.html',
})
export class DigiidFailurePage {
  public finishComment: string;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
  ) {
    this.finishComment = '';
  }

  ionViewWillEnter() {
    this.finishComment = this.navParams.data.error;
  }

  public close(): void {
    this.viewCtrl.dismiss();
  }
}
