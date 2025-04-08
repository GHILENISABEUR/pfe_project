import { Component,OnInit} from '@angular/core';
import {trigger,state,style,transition,animate,} from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-s6o9-sidebar',
  templateUrl: './s6o9-sidebar.component.html',
  styleUrls: ['./s6o9-sidebar.component.css'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          width: '250px',
        })
      ),
      state(
        'closed',
        style({
          width: '70px',
        })
      ),
      transition('open <=> closed', [animate('0.1s')]),
    ]),
  ],
})

export class S6o9SidebarComponent implements OnInit {
  isOpen = false;
  hover = false;
  constructor(private route:ActivatedRoute) {}
  websiteId?:number;

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ",this.websiteId )
      });


  }
  TS_ToggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
