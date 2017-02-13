import { EntityType } from './entity';

export class EntityMetadata {
  location: string;
  properties: Map<string, EntityType> = new Map<string, EntityType>();
}