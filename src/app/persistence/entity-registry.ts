import { Injectable } from '@angular/core';
import { EntityMetadata } from './metadata';
import { EntityType } from './entity';


@Injectable()
export class EntityRegistry {

  private static registry: EntityRegistry = new EntityRegistry();

  static registerEntity(location: string, entityType: EntityType): EntityType {
    return EntityRegistry.registry.registerEntity(location, entityType);
  }

  static registerManyToOne(entityType: EntityType, key: string, propertyType: EntityType): void {
    EntityRegistry.registry.registerManyToOne(entityType, key, propertyType);
  }

  private store: Map<string, EntityType> = new Map<string, EntityType>();

  registerEntity(location: string, entityType: EntityType): EntityType {
    console.log('registering entity: ' + entityType.name);
    //let x = new entityType.prototype.constructor();
    //console.log(x);
    entityType.__emd = entityType.__emd || new EntityMetadata();
    entityType.__emd.location = location;
    //entityType.__emd.properties.forEach((propertyTypeFn: Function, key: string, properties: Map<string, EntityType>) => entityType.__emd.properties.set(key, propertyTypeFn()));
    this.store.set(entityType.name, entityType);
    console.log(entityType.__emd);

    return entityType;
  }

  registerManyToOne(entityType: EntityType, key: string, propertyTypeFn: Function): void {
    console.log('registering property: ' + key);
    entityType.__emd = entityType.__emd || new EntityMetadata();
    entityType.__emd.properties.set(key, propertyTypeFn);
    console.log(entityType.__emd);
  }

  find(name: string): EntityType {
    return this.store.get(name);
  }
}

export class ManagedEntity {
  /** The metadata associated with the class instance */
  static __md: EntityMetadata;

  static getMetadata(): EntityMetadata {
    return this.__md;
  }

  getMetadata(): EntityMetadata {
    return (this.constructor as any).getMetadata();
  }
}
