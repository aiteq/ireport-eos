import { Injectable } from '@angular/core';
import { EntityMetadata } from './metadata';
import { EntityType } from './entity';


@Injectable()
export class EntityRegistry {

  private static store: Map<string, EntityType> = new Map<string, EntityType>();

  static registerEntity(entityType: EntityType, location?: string): EntityType {

    entityType.__emd || this.addEntityMetadata(entityType);
    
    entityType.__emd.location = location;

    this.store.set(entityType.name, entityType);

    return entityType;
  }

  static registerProperty(entityType: EntityType, key: string, propertyTypeFn: Function): void {

    entityType.__emd || this.addEntityMetadata(entityType);

    entityType.__emd.properties.set(key, propertyTypeFn);
  }

  private static addEntityMetadata(entityType: EntityType) {
    Object.defineProperty(entityType, '__emd', {
      value: new EntityMetadata(),
      writable: false,
      configurable: false,
      enumerable: false
    });
  }

  constructor() {

    // initialize all properties metadata for every entity in the registry
    EntityRegistry.store.forEach((entityType: EntityType) => {

      // for every property
      entityType.__emd.properties.forEach((typefn: Function, key: string, properties: Map<string, EntityType>) => {

        // obtaining property's type must be deferred here due to unknown order of entities definitions
        properties.set(key, typefn());

      })
    });
  }

  find(name: string): EntityType {
    return EntityRegistry.store.get(name);
  }

  forEach(callback: Function) {
    return Array.from(EntityRegistry.store.values()).forEach(callback as any);
  }
}

export class ManagedEntity {

  static getMetadata(): EntityMetadata {
    /*
    if ('__emd' in this) {
      throw new Error('No entity metadata (' + this.name + ')');
    }
    */

    return this['__emd'];
  }

  getMetadata(): EntityMetadata {
    return (this.constructor as any).getMetadata();
  }
}
