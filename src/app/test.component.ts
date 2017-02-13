import { Component, OnInit, forwardRef } from '@angular/core';
import { Observable }     from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2';
import { DAO, EntityManager, AbstractEntity, Entity, ManyToOne } from './persistence/index';

@Component({
  selector: 'test',
  templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {
  private daox: DAO<TestEntityX>;
  //private daoy: DAO<TestEntityY>;
  private x: TestEntityX;
  private xs: TestEntityX[] = [];

  constructor (private em: EntityManager, private db: AngularFireDatabase) {
    this.daox = em.getDao<TestEntityX>(TestEntityX);
    //this.daoy = em.getDao<TestEntityY>(TestEntityY);
  }

  ngOnInit() {
    let x = new TestEntityX();
    console.log(x);
    /*
    this.daox.list().subscribe(xs => {
      console.log(xs.length);
      this.xs = xs;
    });
    //*/

    /*
    this.daox.find('-KcdvwpuWt8_h4VCY0Fm').subscribe(x => {
      console.log(x);
    });
    //*/

    /*
    let te = new TestEntityX();
    te.aaa = 'AAA';
    te.bbb = 'BBB';
    te.y = new TestEntityY();
    te.y.ccc = 'CCC';
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
  //@ManyToOne(forwardRef(() => TestEntityY))
  @ManyToOne(() => TestEntityY) y: TestEntityY;
}
@Entity('/test/y')
class TestEntityY extends AbstractEntity {
  ccc: string;
}



