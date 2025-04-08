import { Component, OnInit,ViewChild, ViewContainerRef, ComponentFactoryResolver ,Directive, ElementRef, HostListener, Input} from '@angular/core';
import { AllTablesComponent } from 'src/app/GestionDB/DB/all-tables/all-tables.component'; 
import { AllCategoriesComponent } from 'src/app/GestionDB/DB/all-categories/all-categories.component'; 
import { RapportTablesComponent } from 'src/app/GestionDB/rapports/rapport-tables/rapport-tables.component';

import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-s6o5o1-GestionDB',
  templateUrl: './s6o5o1-GestionDB.component.html',
  styleUrls: ['./s6o5o1-GestionDB.component.css']
})
export class S6o5o1GestionDBComponent implements OnInit {

  @ViewChild('frameContainer', { read: ViewContainerRef }) frameContainer!: ViewContainerRef;
  websiteId?:number;


  constructor(private componentFactoryResolver: ComponentFactoryResolver,private route:ActivatedRoute) {}
  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ",this.websiteId )
      });


  }

  TS_OnDragOver(event: Event) {
    event.preventDefault(); // This is necessary to allow dropping
  }

  TS_OnDrop(event: DragEvent) {
    event.preventDefault();
    const componentType = event.dataTransfer?.getData('componentType')
  }


  /* a supprimer */

  TS_onDragStart(event: DragEvent, componentType: string) {
    event.dataTransfer?.setData('componentType', componentType);
    console.log('Drag Start');
  }
  TS_loadComponent(componentClass: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    this.frameContainer.createComponent(componentFactory);
  }

}
