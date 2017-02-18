import { EntityType } from './entity-type';

export class Relation {
  
  constructor(public entityType: EntityType, public foreignEntityType: EntityType, public type: Relation.Type) {}
}

export namespace Relation {
  export enum Type {
    MANY_TO_ONE,
    ONE_TO_MANY
  }
}