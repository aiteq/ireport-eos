import { ManagedEntity } from './managed-entity';

/**
 * Common abstract class that **all** entities must extend from. Provides common interfaces for other
 * services to interact without knowing about the concrete implementation
 */
export abstract class AbstractEntity extends ManagedEntity {

  id: string;

  constructor(private data?: any) {
    super();
    this.hydrate(data);
    delete this.data;
  }

  protected hydrate(data: Object) {

    if (data) {
      Object.assign(this, data);
    }

    return this;
  }
}
