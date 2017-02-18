import { Injectable } from '@angular/core';
import { EntityMetadata } from './entity-metadata';
import { EntityType } from './entity-type';
import { Relation } from './relation';


@Injectable()
export class EntityRegistry {

  static METADATA_PROPERTY_NAME = '__emd';

  private static store: Map<string, EntityType> = new Map<string, EntityType>();

  static registerEntity(entityType: Function, location?: string): Function {

    this.getMetadata(entityType).location = location;

    this.store.set(entityType.name, (entityType as EntityType));

    return entityType;
  }

  static registerRelation(entityType: Function, key: string, propertyTypeFn: Function, type: Relation.Type): void {

    this.getMetadata(entityType).relations.set(key, new Relation((entityType as EntityType), (propertyTypeFn as EntityType), type));
  }

  private static getMetadata(entityType: Function): EntityMetadata {
    
    if (!entityType[EntityRegistry.METADATA_PROPERTY_NAME]) {

      // create metadata object and getter
      Object.defineProperty(entityType, EntityRegistry.METADATA_PROPERTY_NAME, {
        value: new EntityMetadata(),
        writable: false,
        configurable: false,
        enumerable: false
      });

      Object.defineProperty(entityType, 'getMetadata', {
        value: function() {
          return this[EntityRegistry.METADATA_PROPERTY_NAME];
        },
        writable: false,
        configurable: false,
        enumerable: false
      });
    }

    return entityType[EntityRegistry.METADATA_PROPERTY_NAME];
  }

  constructor() {

    // initialize all properties metadata for every entity in the registry
    EntityRegistry.store.forEach((entityType: EntityType) => {

      // for every relation
      entityType.getMetadata().relations.forEach(
        (relation: Relation, key: string) => {

          // obtaining property's type must be deferred here due to unknown order of class definitions
          relation.foreignEntityType = relation.foreignEntityType();

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
