import { EntityMetadata } from './entity-metadata';
import { EntityRegistry } from './entity-registry';


export abstract class ManagedEntity {

  static getMetadata(): EntityMetadata {
    return this[EntityRegistry.METADATA_PROPERTY_NAME];
  }

  getMetadata(): EntityMetadata {
    return (this.constructor as any).getMetadata();
  }
}
