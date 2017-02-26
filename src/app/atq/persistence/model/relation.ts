import { EntityType } from './entity-type';

export class Relation {
  
  constructor(
    public entityType: EntityType,
    public foreignEntityType: EntityType,
    public type: Relation.Type,
    public cascade?: Relation.Cascade) {

    cascade = cascade || Relation.Cascade.NONE;
  }

  isCascadeAllowed = (test: Relation.Cascade) => (this.cascade & test) == test;
}

export namespace Relation {
  export enum Type {
    MANY_TO_ONE,
    ONE_TO_MANY
  }

  export enum Cascade {
    CREATE = 1,
    UPDATE = 2,
    DELETE = 4,
    ALL = Cascade.CREATE | Cascade.UPDATE | Cascade.DELETE,
    NONE = 8
  }
}