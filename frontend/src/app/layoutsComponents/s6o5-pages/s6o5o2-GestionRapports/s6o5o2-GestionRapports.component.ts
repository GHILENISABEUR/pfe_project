import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { RapportTablesComponent } from 'src/app/GestionDB/rapports/rapport-tables/rapport-tables.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-s6o5o2-GestionRapports',
  templateUrl: './s6o5o2-GestionRapports.component.html',
  styleUrls: ['./s6o5o2-GestionRapports.component.css']
})
export class S6o5o2GestionRapportsComponent implements OnInit  {

  @ViewChild('frameContainer', { read: ViewContainerRef }) frameContainer!: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,private route:ActivatedRoute) {}
  websiteId?:number;

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
    const componentType = event.dataTransfer?.getData('componentType');
  }



  /*  a supprimer  */
  TS_onDragStart(event: DragEvent, componentType: string) {
    event.dataTransfer?.setData('componentType', componentType);
    console.log('Drag Start');
  }

  TS_loadComponent(componentClass: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    this.frameContainer.createComponent(componentFactory);
  }


}
