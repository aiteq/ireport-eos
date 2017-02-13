import { Manageable, Entity } from '../persistence/persistence'

//@Entity('/venues')
export class Venue extends Manageable {

  name: string;
  city: string;
  address: string;

  constructor() {
    super();
    this.name = this.city = this.address = "";
  }
}
