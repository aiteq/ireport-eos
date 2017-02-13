import { OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DAO } from './dao';
import { EntityRegistry } from './entity-registry';
import { AbstractEntity, EntityConstructor, EntityType } from './entity';

export abstract class EntityManager {

  private daos: Map<string, DAO<AbstractEntity>> = new Map<string, DAO<AbstractEntity>>();

  protected abstract find(location: string, id: string): Observable<any>;
  protected abstract list<E extends AbstractEntity>(location: string, query?: Object): Observable<E[]>;
  protected abstract save<E extends AbstractEntity>(location: string, entity: E): any;
  //protected abstract save(transaction: EntityManager.Transaction): any;
  protected abstract generateId<T extends AbstractEntity>(location: string, entity: T): string;

  constructor() {}

  getDao<E extends AbstractEntity>(entityType: EntityType): DAO<E> {

    if (this.daos.has(entityType.name)) {
      return this.daos.get(entityType.name);
    } else {
      let dao: DAO<E> = new EntityManager.DAOImpl<E>(this, entityType);
      this.daos.set(entityType.name, dao);
      return dao;
    }
  }

  private static DAOImpl = class<E extends AbstractEntity> implements DAO<E>, OnDestroy {
    
    private subscriptions: Subscription[] = [];

    constructor(private em: EntityManager, private entityType: EntityType) {
      /*
      let emd: EntityManager.EntityMetadata = entityType.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME];
      for (let prop in emd.properties) {
        if (!emd.properties[prop].entityMetadata) {
          let o = new emd.cnstrctr();
          let r = Reflect.getMetadata("design:type", (o as any).__proto__, emd.properties[prop].key);
          emd.properties[prop].entityMetadata = EntityManager.ENTITIES[emd.properties[prop].className];
        }
      }
      */
    }

    find(id: string): Observable<E> {
      if (typeof id != 'string') {
        Observable.throw(new Error(`DAO.find: missing or invalid 'id' parameter`));
      }

      return this.em.find(this.entityType.__emd.location, id)
        .map((object: Object) => {
          return Object.assign(new this.entityType.prototype.constructor(), object);
        });
        //.map((entity: E) => this.findProperties(entity, emd.properties));
    }

    list(query?: Object): Observable<E[]> {
      throw new Error('not implemented');
      /*
      let emd: EntityManager.EntityMetadata = this.entityType.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME];
      return this.em.list<T>(emd.location, emd.cnstrctr, query).map((entities: T[]) => entities.map((entity: T) => this.findProperties(entity, emd.properties)));
      */
    }

    save(entity: E): Observable<E> {
      throw new Error('not implemented');
      /*
      if (!entity) {
        Observable.throw(new Error(`DAO.save: nothing to save`));
      }

      let emd: EntityManager.EntityMetadata = entity[EntityManager.ENTITY_METADATA_PROPERTY_NAME];
      if (!emd) {
        Observable.throw(new Error(`DAO.save: missing entity metadata`));
      }

      this.em.save(this._prepareToSave(entity, emd));
      return this.find(entity.id);
      */
    }

    private findProperties(entity: E, properties: any): E {
      /*
      for (let key in entity) {
        if (key != 'constructor' && key in properties) {
          let pmd: EntityManager.PropertyMetadata = properties[key];
          if (pmd) {
            if (pmd.entityMetadata.location) {
              this.subscriptions.push(this.em.find(pmd.entityMetadata.location, pmd.entityMetadata.cnstrctr, (entity[key] as any)).subscribe(value => entity[key] = (value as any)));
            } else {
              entity[key] = Object.assign(new pmd.entityMetadata.cnstrctr(), entity[key]);
            }
          }
        }
      }
      */
      return entity;
    }

/*
    private _prepareToSave(entity: Manageable, emd: EntityManager.EntityMetadata, transaction?: EntityManager.Transaction): EntityManager.Transaction {
      transaction = transaction || new EntityManager.Transaction();

      for (let key in entity) {
        if (key != 'constructor' && key in emd.properties) {
          let pmd: EntityManager.PropertyMetadata = emd.properties[key];
          if (pmd) {
            transaction = this._prepareToSave(entity[key], pmd.entityMetadata, transaction);
            // replace property's value with its id
            entity[key] = entity[key].id;
          }
        }
      }

      entity.id = entity.id || this.em.generateId(emd.location, entity);
      transaction.push(new EntityManager.TransactionItem(emd.location, entity));

      return transaction;
    }
*/

    public ngOnDestroy() {
      this.subscriptions.forEach(s => s.unsubscribe());
    }
  }

  protected static Transaction = class extends Array<{ location: string, entity: AbstractEntity}> {}
}