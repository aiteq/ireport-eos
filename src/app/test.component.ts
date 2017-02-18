import { Component, OnInit } from '@angular/core';
import { Observable }     from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2';
import { DAO, EntityManager, AbstractEntity, Entity, ManyToOne, OneToMany } from './atq/persistence';
import { AtqComponent } from './atq/atq-component';

@Component({
  selector: 'test',
  templateUrl: './test.component.html'
})
export class TestComponent extends AtqComponent implements OnInit {
  private daox: DAO<TestEntityX>;
  //private daoy: DAO<TestEntityY>;
  private x: TestEntityX;
  private xs: TestEntityX[] = [];

  constructor (private em: EntityManager, private db: AngularFireDatabase) {
    super();
    this.daox = em.getDao<TestEntityX>(TestEntityX);
    //this.daoy = em.getDao<TestEntityY>(TestEntityY);
  }

  ngOnInit() {
    //*
    this.daox.find('-KdI6RGeIsoEHj6EDvGM').subscribe(x => {
      console.log(x);
    });
    //*/

    /*
    this.daox.list().subscribe(xs => {
      console.log(xs);
    });
    //*/

    /*
    let te = new TestEntityX();
    te.aaa = '2AAA';
    te.bbb = '2BBB';
    te.y = new TestEntityY();
    te.y.ccc = '2CCC';
    te.ys = [te.y, new TestEntityY()];
    te.z = new TestEntityZ();
    te.z.ddd = '2DDD';
    te.zs = [te.z, new TestEntityZ()];
    te.z.y = te.y;
      //console.log(Object.assign({}, te));
    this.daox.save(te).subscribe(t => console.log(t));
    //*/

/*
    this.db.object('/test/xlist/-KbtxAg4_564mvjukkCe').subscribe(x => {
      console.log(x);
      x.aaa = 'AAAxxx';
    });
*/

    /*
    let y = this.db.object('/test/ylist/-KbtxmGLbFFNYalcf4-X');

    let data = {};
    data['/test/xlist/-KbtxAg4_564mvjukkCe/ylist/-KbtxmGLbFFNYalcf4-X'] = true;
    data['/test/ylist/-KbtxmGLbFFNYalcf4-X'] = {
      fff: 'FFF'
    }
    this.db.object('/').update(data);
    */

    //console.log(this.db.list('/test/ylist').push(null).key);
  }
}


@Entity('/test/x')
class TestEntityX extends AbstractEntity {
  aaa: string;
  bbb: string;
  @ManyToOne(() => TestEntityY) y: TestEntityY;
  @ManyToOne(() => TestEntityZ) z: TestEntityZ;
  @OneToMany(() => TestEntityY) ys: TestEntityY[];
  @OneToMany(() => TestEntityZ) zs: TestEntityZ[];
}

@Entity('/test/y')
class TestEntityY extends AbstractEntity {
  ccc: string;
}

@Entity()
class TestEntityZ extends AbstractEntity {
  ddd: string;
  @ManyToOne(() => TestEntityY) y: TestEntityY;
}


