import { Manageable, Entity } from '../persistence/persistence'

@Entity('/users')
export class User extends Manageable {

  static readonly ANONYMOUS = new User();

  name: string = 'Anonymous';
  urlPhoto: string;

}

User.prototype.toString = function() {
  return this.name;
}
