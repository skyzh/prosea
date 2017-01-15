import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DBService } from '../shared';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import * as leven from 'fast-levenshtein';
import * as _ from 'lodash';

@Component({
  selector: 'my-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private __data: any;
  private __data_size: number = 0;
  private _result: any[];
  private _problem: string = "";
  private _answer: string = "";
  private query_status: number = 0;
  private query_subscription: any = null;
  private db_status: number = 0;

  get _data(): any {
    return this.__data;
  }

  set _data(data: any) {
    this.__data = data;
    this.__data_size = data.total_rows;
  }

  constructor(private db: DBService, private modalService: NgbModal) {
    db.fetch().subscribe((data) => this._data = data);
    db.active$.subscribe(() => this.db_status = 0);
    db.pull_paused$.subscribe(err => {
      this.db_status = err ? 2 : 1;
      db.fetch().subscribe((data) => this._data = data);
    });
  }

  ngOnInit() {
  }

  private query(problem: string) {
    if (this.query_subscription) {
      this.query_subscription.unsubscribe();
    }
    this._answer = "";
    if (problem.length >= 5) {
      this.query_subscription = Observable
        .of(problem)
        .delay(500)
        .subscribe(d => {
          this._result = _.chain(this.__data.rows)
            .map((r) => _.merge(r.doc, { 'distance': leven.get(r.doc.problem, problem)}))
            .sortBy('distance')
            .take(8)
            .value();
          this.query_status = 2;
        });
      this.query_status = 1;
    } else {
      this.query_status = 0;
    }
  }

  private searchProblem() {
    this.query(this._problem);
  }

  private submitAnswer() {
    this.query_status = 3;
    this.db.post({
      problem: this._problem,
      answer: this._answer,
      time: Date.now()
    }).subscribe(() => {});
  }

  private setAnswer() {
    this.query_status = 2;
  }

  private clearDatabase() {
    this.db.clear().subscribe(e => window.location.reload());
  }

  private openClearPrompt(content) {
    this.modalService.open(content).result.then((result) => {
      if (result == 'OK') {
        this.clearDatabase();
      }
    }, (reason) => {
      console.log(`Dismissed 233`);
    });
  }
}
