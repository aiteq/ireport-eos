import { AbstractEntity } from './abstract-entity';
import { EntityMetadata } from './entity-metadata';

export type EntityConstructor<E extends AbstractEntity> = { new (...args: any[]): E };

export interface EntityType extends Function {
  getMetadata(): EntityMetadata;
}
