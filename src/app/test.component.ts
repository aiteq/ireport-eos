import { Component, OnInit } from '@angular/core';
import { Observable }     from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2';
import { EntityManager, DAO, Entity, Manageable, ManyToOne } from './persistence/persistence';

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

    this.daox.list().subscribe(xs => {
      console.log(xs.length);
      this.xs = xs;
    });

    /*
    this.daox.find('-KcIFhH-y2lhbtnsLqov').subscribe(x => {
      console.log(x);
      x.bbb = 'test';
      //this.daox.save(x);
    });
    //*/

    /*
    let te = new TestEntityX();
    te.aaa = 'CCC';
    te.bbb = 'DDD';
    te.y = new TestEntityY();
    te.y.ccc = 'yccc';
    this.daox.save(te);
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

@Entity('/test/ylist')
class TestEntityY extends Manageable {
  ccc: string;
  fff: string;
}

@Entity('/test/xlist')
class TestEntityX extends Manageable {
  aaa: string;
  bbb: string;
  @ManyToOne()
  y: TestEntityY;
}



