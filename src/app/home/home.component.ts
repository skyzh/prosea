import { Component, OnInit } from '@angular/core';
import { DBService } from '../shared';

@Component({
  selector: 'my-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private db: DBService) {
   
  }

  ngOnInit() {
    console.log('Hello Home');
  }

}
