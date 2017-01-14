import { Injectable } from '@angular/core';

@Injectable()
export class ApiService {
  title = 'Angular 2';
  db = {
    local_name: "prosea_local",
    remote_name: "prosea_main",
    remote_address: "http://localhost:5984/"
  }
}
