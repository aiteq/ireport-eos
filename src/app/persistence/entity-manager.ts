import { Observable, Subscription } from 'rxjs';
import { DAO } from './dao';
import { EntityRegistry } from './entity-registry';
import { EntityMetadata } from './metadata';
import { AbstractEntity, EntityConstructor, EntityType } from './entity';
import { AtqEnvFriendly } from '../atq/atq-component';

export abstract class EntityManager implements AtqEnvFriendly {

  private daos: Map<string, DAO<AbstractEntity>> = new Map<string, DAO<AbstractEntity>>();

  protected abstract find<E extends AbstractEntity>(location: string, id: string): Observable<E>;
  protected abstract list<E extends AbstractEntity>(location: string, query?: Object): Observable<E[]>;
  //protected abstract save(location: string, entity: AbstractEntity): any;
  protected abstract save(td: EntityManager.TransactionData): void;
  protected abstract generateId<T extends AbstractEntity>(location: string, entity: T): string;


  constructor(protected entityRegistry: EntityRegistry) {}

  getDao<E extends AbstractEntity>(entityType: EntityType): DAO<E> {

    if (this.daos.has(entityType.name)) {
      return this.daos.get(entityType.name);
    } else {
      let dao: DAO<E> = new EntityManager.DAOImpl<E>(this, entityType);
      this.daos.set(entityType.name, dao);
      return dao;
    }
  }

  private static DAOImpl = class<E extends AbstractEntity> implements DAO<E> {
    
    private subscriptions: Subscription[] = [];

    constructor(private em: EntityManager, private entityType: EntityType) {

      if (!entityType.__emd.location) {
        throw new Error(`DAO.constructor: missing storage location for entity '${entityType.name}'. The entity is designed to be a part of a parent entity and stored in its tree.`);
      }
    }

    find(id: string): Observable<E> {
      if (typeof id != 'string') {
        Observable.throw(new Error(`DAO.find: missing or invalid 'id' parameter`));
      }

      return this.findEntity(id, this.entityType);
    }

    list(query?: Object): Observable<E[]> {
      return this.em.list<E>(this.entityType.__emd.location, query)
        .map((objects: Object[]) => objects.map((object: Object) => this.resolveEntity(object, this.entityType)));
    }

    save(entity: E): Observable<E> {

      if (!entity) {
        Observable.throw(new Error('DAO.save: nothing to save'));
      }

      if (!entity.getMetadata) {
        Observable.throw(new Error('DAO.save: entity is not manageable'));
      }

      let emd: EntityMetadata = entity.getMetadata();

      if (!emd.location) {
        Observable.throw(new Error(`DAO.save: '${entity.constructor.name}' is not intended to save directly`));
      }

      this.em.save(this.prepareToSave(entity));
      return this.find(entity.id);
    }

    private findEntity(id: string, entityType: EntityType): Observable<any> {

      return this.em.find<any>(entityType.__emd.location, id)
        .map((object: Object) => this.resolveEntity(object, entityType));
    }

    private resolveEntity(object: Object, entityType: EntityType): AbstractEntity {

      // convert the object returned by the underlaying entity manager to entity type
      let entity: AbstractEntity = Object.assign(new entityType.prototype.constructor(), object);

      // load and convert managed properties
      entityType.__emd.properties.forEach((propertyType: EntityType, key: string) => {

        if (typeof entity[key] === 'string' && propertyType.__emd.location) {

          // load referred sub-entity
          this.subscriptions.push(this.findEntity(entity[key], propertyType).subscribe(value => {
            entity[key] = value;
          }));

        } else if (typeof entity[key] === 'object') {

          // just convert child object - sub-entity is a part of the parent entity
          entity[key] = this.resolveEntity(entity[key], propertyType);
        }

      });

      return entity;
    }

    private prepareToSave(entity: AbstractEntity, td?: EntityManager.TransactionData): EntityManager.TransactionData {

      td = td || new EntityManager.TransactionData();

      for (let key in entity) {

        let pmd: EntityMetadata = entity[key] && entity[key].getMetadata && entity[key].getMetadata();

        if (typeof entity[key] === 'object' && pmd) {

          // prepare property
          this.prepareToSave(entity[key], td);

          if (pmd.location) {
            // replace property's value with its id, if the property is manageable
            entity[key] = entity[key].id;
          }
        }
      }

      let emd: EntityMetadata = entity.getMetadata();

      if (emd.location && !entity.id) {
        entity.id = this.em.generateId(emd.location, entity);
        td.push(new EntityManager.TransactionElement(emd.location, entity));
      }

      return td;
    }

    private unsubscribeAll() {
      this.subscriptions.forEach(s => s.unsubscribe());
    }
  }

  public atqCleanUp() {
    this.daos.forEach((dao: any) => dao.unsubscribeAll());
  }
}

export namespace EntityManager {
  export class TransactionElement {
    constructor(public location: string, public entity: AbstractEntity) {}
  }

  export class TransactionData extends Array<TransactionElement> {}
}