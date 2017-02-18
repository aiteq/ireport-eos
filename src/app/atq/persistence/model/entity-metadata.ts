import { EntityType } from './entity-type';
import { Relation } from './relation';

export class EntityMetadata {

  // storage-specific path
  location: string;

  // relations
  relations: Map<string, Relation> = new Map<string, Relation>();
}