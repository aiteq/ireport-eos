import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
}
