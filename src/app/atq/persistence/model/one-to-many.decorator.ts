import { EntityRegistry } from './entity-registry';
import { Relation } from './relation';

export function OneToMany(typefn: Function): PropertyDecorator {
  
  return (target: Function, key: string) =>
    EntityRegistry.registerRelation(target.constructor, key, typefn, Relation.Type.ONE_TO_MANY);
}

