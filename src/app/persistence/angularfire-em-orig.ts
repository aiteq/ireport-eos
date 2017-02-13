import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2';
import { EntityManager, Manageable, DAO } from './persistence';

@Injectable()
export class AngularfireEntityManagerX extends EntityManager {

  constructor(private db: AngularFireDatabase) {
    super();
  }

  private fromDb<T extends Manageable>(dbEntity: any, constructor: { new (...args: any[]): Manageable }): T {
    let entity: T = Object.assign(new constructor(), dbEntity);

    // add id
    Object.defineProperty(entity, 'id', {
      value: (dbEntity as any).$key,
      writable: false,
      configurable: false,
      enumerable: false
    });

    // remove Angularfire's properties
    delete (entity as any).$exists;
    delete (entity as any).$key;
    delete (entity as any).$value;

    return entity;
  }

  protected find<T extends Manageable>(location: string, constructor: { new (...args: any[]): Manageable }, id: string): Observable<T> {
    return this.db.object(`${location}/${id}`).map((entity: T) => this.fromDb(entity, constructor));
  }

  protected list<T extends Manageable>(location: string, constructor: { new (...args: any[]): Manageable }, query?: Object): Observable<T[]> {
    return this.db.list(`${location}/`, { query : query }).map((entities: T[]) => entities.map((entity: T) => this.fromDb(entity, constructor)));
  }

  protected save(transaction: EntityManager.Transaction) {
    let updateData: {} = {};
    transaction.forEach(item => updateData[`${item.location}/${item.entity.id}`] = item.entity);

    this.db.object('/').update(updateData);
    /*
    if (entity.id) {
      this.db.object(`${location}/${entity.id}`).update(entity);
    } else {
      entity.id = this.db.list(`${location}/`).push(entity).key;
    }
    return entity.id;
    */
  }

  protected generateId<T extends Manageable>(location: string, entity: T): string {
    return this.db.list(location).push(null).key;
  }

    /*
  protected update<T extends Manageable>(location: string, entity: T): Observable<T> {
    return null;
    console.log('updating in ' + location);
    let updateData = {};

    delete (entity as any).$exists;
    delete (entity as any).$key;
    delete (entity as any).$value;
    updateData[`${location}/`] = entity;

    let refpath = location + entity.id;
    for (let prop in entity) {
      if (entity[prop] && entity[prop].constructor && entity[prop].constructor.prototype && entity[prop].constructor.prototype[EntityManager.ENTITY_INFO_PROP]) {
        console.log('...manageable');
        let child: Manageable = entity[prop] as any;
        console.log('...child id: ' + child.id);
        if (child.id) {
          updateData[`${entity[prop].constructor.prototype[EntityManager.ENTITY_METADATA_PROPERTY_NAME].location}/${child.id}/_refs/${entity.id}`] = location;
        } else {
          throw new Error('Not implemented: child w/o id');
        }
      }
    }

    console.log(updateData);

    this.db.object('/').update(updateData);
    //this.db.object(`${location}/${entity.$key}`).update(entity);
    return this.find(location, entity.id);
  }
    */
}
