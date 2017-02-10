import { OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import 'core-js/es6';

/*
 * @Entity decorator
 */
export function Entity<T extends Manageable>(location: string) {
  return (target: any) => EntityManager.registerEntity(target, location);
}

/*
 * @ManyToOne decorator
 */
export function ManyToOne() {
  return (target: any, key: string) => EntityManager.registerProperty(target, key);
}

export class Manageable {
  public id: string;
}

export interface DAO<T extends Manageable> {
  find(id: string): Observable<T>;
  list(query?: Object): Observable<T[]>;
  save(entity: T): Observable<T>;
}

export abstract class EntityManager {
  public static readonly ENTITY_METADATA_PROPERTY_NAME = '__entityMeta';
  public static ENTITIES: { [ name: string ]: EntityManager.EntityMetadata } = {};

  private daos: { [className: string]: DAO<any> } = {};

  protected abstract find<T extends Manageable>(location: string, constructor: { new (...args: any[]): Manageable }, id: string): Observable<T>;
  protected abstract list<T extends Manageable>(location: string, constructor: { new (...args: any[]): Manageable }, query?: Object): Observable<T[]>;
  protected abstract save(transaction: EntityManager.Transaction): any;
  protected abstract generateId<T extends Manageable>(location: string, entity: T): string;
  //protected abstract transaction<T extends Manageable>(location: string, atomic: Function);

  public getDao<T extends Manageable>(entityType: Function): DAO<T> {
    let className = entityType.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME].className ||
      (() => { throw new Error(`Entity type '${(entityType as any).name}' is not manageable`) })();
      this.daos[className] = new EntityManager.DAOImpl<T>(this, entityType);
    return this.daos[className] || (this.daos[className] = new EntityManager.DAOImpl<T>(this, entityType));
  }

  private static DAOImpl = class<T extends Manageable> implements DAO<T>, OnDestroy {
    private subscriptions: Subscription[] = [];

    constructor(private em: EntityManager, private entityType: Function) {
      let emd: EntityManager.EntityMetadata = entityType.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME];
      for (let prop in emd.properties) {
        if (!emd.properties[prop].entityMetadata) {
          emd.properties[prop].entityMetadata = EntityManager.ENTITIES[emd.properties[prop].className];
        }
      }
    }

    private findProperties(entity: T, properties: { [key: string] : EntityManager.PropertyMetadata }): T {
      for (let key in entity) {
        if (key != 'constructor' && key in properties) {
          let pmd: EntityManager.PropertyMetadata = properties[key];
          if (pmd) {
            this.subscriptions.push(this.em.find(pmd.entityMetadata.location, pmd.entityMetadata.cnstrctr, (entity[key] as any)).subscribe(value => entity[key] = (value as any)));
          }
        }
      }
      return entity;
    }

    find(id: string): Observable<T> {
      if (typeof id != 'string' || id == null) {
        Observable.throw(new Error(`DAO.find: missing or invalid 'id' parameter`));
      }

      let emd: EntityManager.EntityMetadata = this.entityType.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME];
      return this.em.find<T>(emd.location, emd.cnstrctr, id).map((entity: T) => this.findProperties(entity, emd.properties));
    }

    list(query?: Object): Observable<T[]> {
      let emd: EntityManager.EntityMetadata = this.entityType.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME];
      return this.em.list<T>(emd.location, emd.cnstrctr, query).map((entities: T[]) => entities.map((entity: T) => this.findProperties(entity, emd.properties)));
    }

    save(entity: T): Observable<T> {
      if (!entity) {
        Observable.throw(new Error(`DAO.save: nothing to save`));
      }

      let emd: EntityManager.EntityMetadata = entity[EntityManager.ENTITY_METADATA_PROPERTY_NAME];
      if (!emd) {
        Observable.throw(new Error(`DAO.save: missing entity metadata`));
      }

      this.em.save(this._prepareToSave(entity, emd));
      return this.find(entity.id);
    }

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

    public ngOnDestroy() {
      this.subscriptions.forEach(s => s.unsubscribe());
    }
  }


  /******************************************************************
   *
   *  metadata registers
   *
   */

  public static registerEntity(target: any, location: string) {
    //new target.prototype.constructor() instanceof Manageable || (() => { throw new Error(`Entity '${target.name}' must extend the Manageable class`); })();
    let emd: EntityManager.EntityMetadata = target.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME] ||
      (EntityManager.ENTITIES[target.name] = EntityManager.createEntityMetadata(target, location));
    emd.location = location;
  }

  public static registerProperty(target: any, key: string) {
    let emd: EntityManager.EntityMetadata = target.constructor.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME] ||
      (EntityManager.ENTITIES[target.constructor.name] = EntityManager.createEntityMetadata(target.constructor, null));

    let pmd: EntityManager.PropertyMetadata = new EntityManager.PropertyMetadata();
    pmd.key = key;
    pmd.className = Reflect.getMetadata("design:type", target, key).name;
    target.constructor.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME].properties[key] = pmd;
  }

  private static createEntityMetadata(target: any, location: string): EntityManager.EntityMetadata {
    let emd = new EntityManager.EntityMetadata();
    emd.location = location;
    emd.className = target.name;
    emd.cnstrctr = target.prototype.constructor;
    emd.properties = {};

    Object.defineProperty(target.prototype, EntityManager.ENTITY_METADATA_PROPERTY_NAME, {
      value: emd,
      writable: false,
      configurable: false,
      enumerable: false
    });

    return emd;
  }
}

export namespace EntityManager {
  export class EntityMetadata {
    public location: string;
    public className: string;
    public cnstrctr: { new (...args: any[]): Manageable };
    public properties: { [key: string] : PropertyMetadata };
  }

  export class PropertyMetadata {
    public key: string;
    public className: string;
    public entityMetadata: EntityMetadata;
  }

  export class Transaction extends Array<TransactionItem> {    
  }

  export class TransactionItem {
    constructor(public location: string, public entity: Manageable) {}
  }
}
