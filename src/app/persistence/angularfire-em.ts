import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2';
import { EntityRegistry } from './entity-registry';
import { EntityManager } from './entity-manager';
import { AbstractEntity } from './entity';

type AngularfireEntity = {
  $key: string;
  $value: string;
  $exists: any;
};

@Injectable()
export class AngularfireEntityManager extends EntityManager {

  constructor(protected entityRegistry: EntityRegistry, private db: AngularFireDatabase) {
    super(entityRegistry);
  }

  private fromDb(afEntity: AngularfireEntity): any {

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

  protected find<E extends AbstractEntity>(location: string, id: string): Observable<E> {

    return this.db.object(`${location}/${id}`)
      .map((afEntity: AngularfireEntity) => this.fromDb(afEntity));
  }

  protected list<E extends AbstractEntity>(location: string, query?: Object): Observable<E[]> {

    return this.db.list(`${location}/`, { query : query })
      .map((afEntities: AngularfireEntity[]) => afEntities.map((afEntity: AngularfireEntity) => this.fromDb(afEntity)));
  }

  /*
  protected save(location: string, entity: AbstractEntity): string {

    if (entity.id) {

      // update existing
      this.db.object(`${location}/${entity.id}`).update(entity);
      return entity.id;

    } else {

      // create new
      return this.db.list(`${location}/`).push(entity).key;

    }
  }
  */

  protected save(td: EntityManager.TransactionData): void {

    let updateData: {} = {};
    td.forEach((te: EntityManager.TransactionElement) => updateData[`${te.location}/${te.entity.id}`] = te.entity);

    this.db.object('/').update(updateData);
  }

  protected generateId(location: string, entity: AbstractEntity): string {

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
