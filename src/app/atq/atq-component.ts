import { OnDestroy } from '@angular/core';

export interface AtqEnvFriendly {
  atqCleanUp(): void;
}

abstract class AtqEnvFriendlyComponent implements AtqEnvFriendly, OnDestroy {

  constructor() {
    let origOnDestroyHandler = this.ngOnDestroy;

    this.ngOnDestroy = () => {
        origOnDestroyHandler();
        this.cleanUpAll();
    };
  }

  ngOnDestroy(): void {}

  log(message: string): void {
    console.log(message);
  }

  atqCleanUp(): void {}

  private cleanUpAll(): void {
    Object.values(this).forEach(trash => {
      if (typeof trash === 'object' && 'atqCleanUp' in trash) {
        (<AtqEnvFriendly>trash).atqCleanUp();
      }
    });

    this.atqCleanUp();
  }
}

export class AtqComponent extends AtqEnvFriendlyComponent {}
