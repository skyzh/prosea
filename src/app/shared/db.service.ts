import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import * as PouchDB from 'pouchdb';
import * as _ from 'lodash';

interface SocketConfiguration extends PouchDB.Configuration.CommonDatabaseConfiguration {
  url: string
};

@Injectable()
export class DBService {

  private database: any;
  private remote_db: any;

  private _observables: any = {};

  get change$(): Observable<any> {
    return this._observables.change;
  }
  get paused$(): Observable<any> {
    return this._observables.paused;
  }
  get active$(): Observable<any> {
    return this._observables.active;
  }
  get denied$(): Observable<any> {
    return this._observables.denied;
  }
  get complete$(): Observable<any> {
    return this._observables.complete;
  }
  get error$(): Observable<any> {
    return this._observables.error;
  }

  private bindEventListener(sync: any, name: string) {
    this._observables[name] = Observable.fromEventPattern(
      (h) => sync.on(name, h),
      (h) => sync.off(name, h)
    );
  }
  public constructor(private api: ApiService) {
    if(!this.database) {
      PouchDB['adapter']('socket', require('socket-pouch/client'));
      this.database = new PouchDB(api.db.local_name);
      console.log("ws://" + api.db.remote_address)
      this.remote_db = new PouchDB(api.db.remote_name, <SocketConfiguration>{
        adapter: 'socket',
        url: "ws://" + api.db.remote_address + "/"
      });
      let _sync = this.database.sync(this.remote_db, {
        live: true,
        retry: true
      });
      _(['change', 'paused', 'active', 'denied', 'complete', 'error'])
        .forEach((name) => this.bindEventListener(_sync, name));
    }
  }

  private _fetch() {
    return this.database.allDocs({include_docs: true});
  }

  private _get(id: string) {
    return this.database.get(id);
  }

  private _put(id: string, document: any) {
    document._id = id;
    return this._get(id).then(result => {
      document._rev = result._rev;
      return this.database.put(document);
    }, error => {
      if(error.status == '404') {
        return this.database.put(document);
      } else {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }
    });
  }

  public get(id: string): Observable<any> {
    return Observable.fromPromise(this._get(id));
  }

  public put(id: string, document: any): Observable<any> {
    return Observable.fromPromise(this._put(id, document));
  }

  public post(document: any): Observable<any> {
    return Observable.fromPromise(this.database.post(document));
  }

  public fetch(): Observable<any> {
    return Observable.fromPromise(this._fetch());
  }

}

export const DB_STATUS = [
  "syncing...",
  "complete"
];