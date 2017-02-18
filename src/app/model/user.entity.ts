import { AbstractEntity, Entity } from '../atq/persistence';

@Entity('/users')
export class User extends AbstractEntity {

  static readonly ANONYMOUS = new User();

  name: string = 'Anonymous';
  urlPhoto: string;

}

User.prototype.toString = function() {
  return this.name;
}
