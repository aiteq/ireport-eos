import { AbstractEntity, Entity, ManyToOne } from '../atq/persistence';
import { User } from './user.entity';

@Entity()
export class Application extends AbstractEntity {

  @ManyToOne(() => User) user: User;
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
