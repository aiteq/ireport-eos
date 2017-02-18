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
export function Entity(location?: string): ClassDecorator {
  return (target: Function) => EntityRegistry.registerEntity(target, location);
}

