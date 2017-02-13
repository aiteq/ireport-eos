import { Manageable, ManyToOne } from '../persistence/persistence'
import { User } from './user.entity';

export class Application extends Manageable {
  @ManyToOne() user: User;
  job: Application.Job;
  guestsRequested: number;
  guestsConfirmed: number;
}

export namespace Application {
  export enum Job {
    EDITOR,
    PHOTOGRAPHER
  }
}
