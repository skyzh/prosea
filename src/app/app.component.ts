import { Component } from '@angular/core';

import { ApiService, DBService, DB_STATUS } from './shared';

import '../style/app.scss';

@Component({
  selector: 'my-app', // <my-app></my-app>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  url = 'https://github.com/preboot/angular2-webpack';

  private db_status: number = 0;

  constructor(private api: ApiService, private db: DBService) {
    db.active$.subscribe(() => this.db_status = 0);
    db.paused$.subscribe((err) => this.db_status = 1);
    db.change$.subscribe((info) => db.fetch().subscribe((info) => console.log(info)));
  }
}
