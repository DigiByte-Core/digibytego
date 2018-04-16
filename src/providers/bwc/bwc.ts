import { Injectable } from '@angular/core';

import { Logger } from '../../providers/logger/logger';

import * as BWC from 'digibytejs-wallet-client';

@Injectable()
export class BwcProvider {
  public buildTx = BWC.buildTx;
  public parseSecret = BWC.parseSecret;
  public Client = BWC;
  constructor(
    private logger: Logger
  ) {
    this.logger.info('BwcProvider initialized.');
  }
  public getBitcore(): any {
    return BWC.Digibyte;
  }

  public getErrors(): any {
    return BWC.errors;
  }

  public getSJCL(): any {
    return BWC.sjcl;
  }

  public getUtils(): any {
    return BWC.Utils;
  }

  public getClient(walletData?, opts?): any {
    opts = opts || {};

    // note opts use `bwsurl` all lowercase;
    let bwc = new BWC({
      baseUrl: opts.bwsurl || 'http://localhost:3232/dws/api',
      verbose: opts.verbose,
      timeout: 100000,
      transports: ['polling'],
    });
    if (walletData)
      bwc.import(walletData, opts);
    return bwc;
  }

}
