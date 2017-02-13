import { EntityRegistry } from './entity-registry';

/**
 *  @Entity decorator
 *
 * class Example:
 * ```typescript
 *
 *  @Entity()
 *  export class ExampleEntity extends AbstractEntity {}
 * ```
 * @returns {ClassDecorator}
 * @constructor
 */
export function Entity(location: string): ClassDecorator {
  return (target: Function) => EntityRegistry.registerEntity(location, target);
}

export function ManyToOne(typefn: Function): PropertyDecorator {
  return (target: Function, key: string) => EntityRegistry.registerManyToOne(target.constructor, key, typefn);
}
