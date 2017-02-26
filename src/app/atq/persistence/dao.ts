import { Observable } from 'rxjs';
import { AbstractEntity } from './model/abstract-entity'
import { EntityManager } from './entity-manager';

export interface DAO<E extends AbstractEntity> {

  find(id: string): Observable<E>;
  list(query?: Object): Observable<E[]>;
  save(entity: E, updateData?: Object): Observable<E>;
  //update(entity: E, updateData: Object): void;
}
