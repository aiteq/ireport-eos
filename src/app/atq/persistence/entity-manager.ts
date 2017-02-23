import { Observable, Subscription } from 'rxjs';
import { DAO } from './dao';
import { EntityRegistry } from './model/entity-registry';
import { EntityMetadata } from './model/entity-metadata';
import { AbstractEntity } from './model/abstract-entity';
import { EntityType } from './model/entity-type';
import { Relation } from './model/relation';
import { AtqEnvFriendly } from '../atq-component';

export abstract class EntityManager implements AtqEnvFriendly {

  private daos: Map<string, DAO<AbstractEntity>> = new Map<string, DAO<AbstractEntity>>();
  private streams: Map<string, Observable<AbstractEntity>> = new Map<string, Observable<AbstractEntity>>();

  protected abstract find(location: string, id: string): Observable<Object>;
  protected abstract list(location: string, query?: Object): Observable<Object[]>;
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

      if (!entityType.getMetadata().location) {
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
      return this.em.list(this.entityType.getMetadata().location, query)
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

      let stream = this.em.streams.get(id);
      if (!stream) {
        stream = this.em.find(entityType.getMetadata().location, id)
          .map((object: Object) => this.resolveEntity(object, entityType));
        this.em.streams.set(id, stream);
      }

      return stream;
    }

    private resolveEntity(object: Object, entityType: EntityType): AbstractEntity {

      // convert the object returned by the underlaying entity manager to entity type
      let entity: AbstractEntity = Object.assign(new entityType.prototype.constructor(), object);
      Object.defineProperty(entity, 'id', {
        writable: false,
        configurable: false,
        enumerable: true
      });

      // load and convert managed properties
      entityType.getMetadata().relations.forEach((relation: Relation, key: string) =>
        this.resolveRelation(entity, key, relation.foreignEntityType));

      return entity;
    }

    private resolveRelation(object: Object, key: string | number, foreignEntityType: EntityType): void {

      if (typeof object[key] === 'string' && foreignEntityType.getMetadata().location) {

        // many-to-one
        this.subscriptions.push(this.findEntity(object[key], foreignEntityType).subscribe(value => {
          object[key] = value;
        }));

      } else if (typeof object[key] === 'object') {

        if (Array.isArray(object[key])) {

          // one-to-many
          (object[key] as AbstractEntity[]).forEach((item, index) => {
            this.resolveRelation(object[key], index, foreignEntityType);
          });

        } else {

          // denormalized property
          object[key] = this.resolveEntity(object[key], foreignEntityType);
        }
      }
    }

    private prepareToSave(entity: AbstractEntity, td?: EntityManager.TransactionData): EntityManager.TransactionData {

      td = td || new EntityManager.TransactionData();

      let emd: EntityMetadata = entity.getMetadata();

      emd.relations.forEach((relation, key) => {

        if (typeof entity[key] !== 'object') {
          return;
        }

        switch (relation.type) {

          case Relation.Type.MANY_TO_ONE:

            // prepare property object to save
            this.prepareToSave(entity[key], td);

            if (relation.foreignEntityType.getMetadata().location) {
              // replace property's value with its id, if the property is manageable
              entity[key] = entity[key].id;
            }

            break;

          case Relation.Type.ONE_TO_MANY:

            let array: AbstractEntity[] = entity[key];

            array.forEach(item => this.prepareToSave(item, td));

            if (relation.foreignEntityType.getMetadata().location) {
              entity[key] = array.map(item => {
                return item.id;
              });
            }

            break;
        }
      });

      /*
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
      */

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