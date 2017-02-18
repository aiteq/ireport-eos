import { EntityRegistry } from './entity-registry';
import { Relation } from './relation';

export function ManyToOne(typefn: Function): PropertyDecorator {
  
  return (target: Function, key: string) =>
    EntityRegistry.registerRelation(target.constructor, key, typefn, Relation.Type.MANY_TO_ONE);
}

