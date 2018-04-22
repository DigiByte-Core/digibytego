import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import * as _ from 'lodash';

// Providers

@Component({
  selector: 'page-digiid-success',
  templateUrl: 'digiid-success.html',
})
export class DigiidSuccessPage {
  public finishComment: string;

  constructor(
    private viewCtrl: ViewController,
  ) {
    this.finishComment = '';
  }

  public close(): void {
    this.viewCtrl.dismiss();
  }
}
