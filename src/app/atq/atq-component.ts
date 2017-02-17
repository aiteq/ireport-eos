import { OnDestroy } from '@angular/core';

export interface AtqEnvFriendly {
  atqCleanUp(): void;
}

abstract class AtqEnvFriendlyComponent implements OnDestroy {

  constructor() {
    let origOnDestroyHandler = this.ngOnDestroy;

    this.ngOnDestroy = () => {
        origOnDestroyHandler();
        this.cleanUpAll();
    };
  }

  ngOnDestroy(): void {}

  private cleanUpAll(): void {
    Object.values(this).forEach(trash => {
      if ('atqCleanUp' in trash) {
        (<AtqEnvFriendly>trash).atqCleanUp();
      }
    });
  }
}

export class AtqComponent extends AtqEnvFriendlyComponent {
  
}
