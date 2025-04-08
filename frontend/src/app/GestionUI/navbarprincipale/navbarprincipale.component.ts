import { Component,OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbarprincipale',
  templateUrl: './navbarprincipale.component.html',
  styleUrls: ['./navbarprincipale.component.css']
})
export class NavbarprincipaleComponent implements OnInit {
  websiteId:any;
  constructor(private route:ActivatedRoute) {}

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ",this.websiteId )
      });}
}
