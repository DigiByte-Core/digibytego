import { Injectable } from '@angular/core';

// Providers
import { BwcProvider } from '../../providers/bwc/bwc';

@Injectable()
export class AddressProvider {
  private bitcore: any;

  constructor(
    private bwcProvider: BwcProvider,
  ) {
    this.bitcore = this.bwcProvider.getBitcore();
  }

  translateAddress(address: string) {

    var origAddress = new this.bitcore.Address(address);
    var origObj = origAddress.toObject();

    var resultAddress = this.bitcore.Address.fromObject(origObj);
    return {
      origAddress: address,
      resultAddress: resultAddress.toString()
    };
  };

  validateAddress(address: string) {
    let Address = this.bitcore.Address;
    let isLivenet = Address.isValid(address, 'livenet');
    let isTestnet = Address.isValid(address, 'testnet');
    return {
      address,
      isValid: isLivenet || isTestnet,
      network: isTestnet ? 'testnet' : 'livenet',
      translation: this.translateAddress(address),
    };
  }
}