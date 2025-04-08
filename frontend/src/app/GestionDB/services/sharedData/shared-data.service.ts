import { Injectable } from '@angular/core';
import { S_VisualService } from '../visualService/visual.service';
@Injectable({
  providedIn: 'root'
})
export class S_SharedDataService {
  private dataTable: {data: any[] }[] = [];
  private type:string="";
  private selectedFieldsByTableId: { [tableId: string]: { id: string; name: string; data: any[] }[] } = {};
  constructor(private V_visualService:S_VisualService) {}

  registerDataTableFieldsData( data: any[],type:string): void {
    this.dataTable=data;
    this.type=type;
    console.log("shared data" ,this.dataTable);
    console.log("shared data type" ,this.type);

  }
  registerSelectedFieldsByTableId(selectedFieldsByTableId: { [tableId: string]: { id: string; name: string; data: any[] }[] }): void {
    this.selectedFieldsByTableId = selectedFieldsByTableId;
    console.log("selected fields by table id regestred by this is " ,this.selectedFieldsByTableId);       
  }
  getSelectedFieldsByTableId(): { [tableId: string]: { id: string; name: string; data: any[] }[] } {
    return this.selectedFieldsByTableId;
  }
  getType():string{
    return this.type;
  
  }

  getDataTableFieldsData(): { data: any[] }[] {
    return this.dataTable;
  }

  clearDataTableFieldsData(): void {
    this.dataTable = [];
  }
  clearSelectedFieldsByTableId():void{
    this.selectedFieldsByTableId={};
  }
  
}