import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2';
import { EntityRegistry } from './entity-registry';
import { EntityManager } from './entity-manager';
import { AbstractEntity } from './entity';

type AngularfireEntity = {
  $key: string;
  $value: string;
  $exists: boolean;
};

@Injectable()
export class AngularfireEntityManager extends EntityManager {

  constructor(private db: AngularFireDatabase) {
    super();
  }

  private fromDb(afEntity: AngularfireEntity): any {
    console.log('----> CHECK TYPE OF $exists -> change AngularfireEntity interface');
    console.log(afEntity);

    // add id
    Object.defineProperty(afEntity, 'id', {
      value: afEntity.$key,
      writable: false,
      configurable: false,
      enumerable: false
    });

    // remove Angularfire's properties
    delete afEntity.$exists;
    delete afEntity.$key;
    delete afEntity.$value;

    return afEntity;
  }

  protected find(location: string, id: string): Observable<any> {
    return this.db.object(`${location}/${id}`).map((afEntity: AngularfireEntity) => this.fromDb(afEntity));
  }

  protected list<E extends AbstractEntity>(location: string, query?: Object): Observable<E[]> {
    return undefined;//this.db.list(`${location}/`, { query : query }).map((entities: T[]) => entities.map((entity: T) => this.fromDb(entity, constructor)));
  }

  protected save() {
    /*
    let updateData: {} = {};
    transaction.forEach(item => updateData[`${item.location}/${item.entity.id}`] = item.entity);

    this.db.object('/').update(updateData);
    */
    /*
    if (entity.id) {
      this.db.object(`${location}/${entity.id}`).update(entity);
    } else {
      entity.id = this.db.list(`${location}/`).push(entity).key;
    }
    return entity.id;
    */
  }

  protected generateId<E extends AbstractEntity>(location: string, entity: E): string {
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
