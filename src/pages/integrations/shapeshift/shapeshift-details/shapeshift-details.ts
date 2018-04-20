import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Logger } from '../../../../providers/logger/logger';

// Providers
import { ConfigProvider } from '../../../../providers/config/config';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { ShapeshiftProvider } from '../../../../providers/shapeshift/shapeshift';

@Component({
  selector: 'page-shapeshift-details',
  templateUrl: 'shapeshift-details.html',
})
export class ShapeshiftDetailsPage {

  public ssData: any;

  private defaults: any;

  constructor(
    private configProvider: ConfigProvider,
    private externalLinkProvider: ExternalLinkProvider,
    private navParams: NavParams,
    private shapeshiftProvider: ShapeshiftProvider,
    private viewCtrl: ViewController,
    private logger: Logger
  ) {
    this.defaults = this.configProvider.getDefaults();
    this.ssData = this.navParams.data.ssData;
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad ShapeshiftDetailsPage');
  }

  public remove() {
    this.shapeshiftProvider.saveShapeshift(this.ssData, {
      remove: true
    }, (err) => {
      this.close();
    });
  }

  public close() {
    this.viewCtrl.dismiss();
  }

  public openTransaction(id: string) {
    var url = 'https://' + this.defaults.blockExplorerUrl + '/tx/' + id;
    this.externalLinkProvider.open(url);
  }

}
