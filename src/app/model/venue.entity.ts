import { AbstractEntity, Entity } from '../atq/persistence';

@Entity('/venues')
export class Venue extends AbstractEntity {

  name: string;
  city: string;
  address: string;

  constructor() {
    super();
    this.name = this.city = this.address = "";
  }
}
