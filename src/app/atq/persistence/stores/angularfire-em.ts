import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2';
import { EntityRegistry } from '../model/entity-registry';
import { EntityManager } from '../entity-manager';
import { AbstractEntity } from '../model/abstract-entity';

type AngularfireEntity = {
  id: string;
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
    afEntity.id = afEntity.$key;

    // remove Angularfire's properties
    delete afEntity.$exists;
    delete afEntity.$key;
    delete afEntity.$value;

    return afEntity;
  }

  protected find(location: string, id: string): Observable<Object> {

    return this.db.object(`${location}/${id}`)
      .map((afEntity: AngularfireEntity) => this.fromDb(afEntity));
  }

  protected list(location: string, query?: Object): Observable<Object[]> {

    //return this.db.list(`${location}/`, { query : query }).first().map((afEntities: AngularfireEntity[]) => afEntities.map((afEntity: AngularfireEntity) => this.fromDb(afEntity)));

    return this.db.list(`${location}/`, { query : query }).map((afEntities: AngularfireEntity[]) => {
      let seen: string[] = [];
      return afEntities.filter((afEntity: AngularfireEntity) => {
        // filter duplicates - angularfire2 issue
        if (seen.indexOf(afEntity.$key) > -1) {
          console.warn(`AngularfireEntityManager.list: omitting duplicate: ${location}`);
          return false;
        } else {
          seen.push(afEntity.$key);
          return true;
        }
      }).map((afEntity: AngularfireEntity) => this.fromDb(afEntity));
    });
  }

  protected save(td: EntityManager.TransactionData): void {

    let updateData: {} = {};

    td.forEach((te: EntityManager.TransactionElement) => {
      if (te.updateData) {
        Object.keys(te.updateData).forEach(key => updateData[`${te.location}/${te.entity.id}/${key}`] = te.updateData[key]);
      } else {
        updateData[`${te.location}/${te.entity.id}`] = te.entity;
      }
    });

    console.log(updateData);

    /*
    // remove properties containing undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
*/

    this.db.object('/').update(updateData);
  }

  //protected update()

  protected generateId(location: string, entity: AbstractEntity): string {

    return this.db.list(location).push(null).key;
  }
}
