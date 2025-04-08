import { Component, Input, OnInit } from '@angular/core';
import { S_TableService } from 'src/app/GestionAuth/services/TableService/Table.service'; 
import { S_SharedDataService } from '../../services/sharedData/shared-data.service'; 

@Component({
  selector: 'app-data-table-rapport',
  templateUrl: './data-table-rapport.component.html',
  styleUrls: ['./data-table-rapport.component.css']
})
export class DataTableRapportComponent implements OnInit {
  @Input() selectedFieldsByTableId: { [tableId: string]: { id: string; name: string; data: any[] }[] } = {};

  tables: any[] = [];
  selectedTables: any[] = [];
  fields: any[] = [];
  fieldsByTableId: { [tableId: string]: any[] } = {};
  offsetX: number = 0;
  offsetY: number = 0;
  combinedDetailsData: any[] = []; // Array to store combined details data

  constructor(private V_tableService: S_TableService , private V_sharedDataService:S_SharedDataService) {}

  ngOnInit() {
    this.TS_createData();
    console.log("sending data ",this.selectedFieldsByTableId);

  }
  TS_createData(){
    const tableIds = this.TS_objectKeys(this.selectedFieldsByTableId);

    // Determine the maximum number of rows across all tables
    let maxRows = 0;
    tableIds.forEach(tableId => {
      const field = this.selectedFieldsByTableId[tableId][0]; // Choose the first field for simplicity
      maxRows = Math.max(maxRows, field.data.length);
    });

    // Create combinedDetailsData with aligned rows
    for (let i = 0; i < maxRows; i++) {
      const rowData: any = {}; // Object to store combined row data
      tableIds.forEach(tableId => {
        const fields = this.selectedFieldsByTableId[tableId]; // Get all selected fields for the table
        fields.forEach(field => {
          const details = (field.data[i] && field.data[i].details) || {}; // Fill with empty object if no data
          rowData[field.name] = details[field.name] || ''; // Assign data or empty string if missing
        });
      });
      this.combinedDetailsData.push(rowData);
    }
    this.TS_shareData();


    console.log('Combined Details Data:', this.combinedDetailsData);
  }
  TS_objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  TS_shareData(){
    this.V_sharedDataService.registerDataTableFieldsData(this.combinedDetailsData,"data-table");
    console.log("data shared",this.combinedDetailsData);
    this.V_sharedDataService.registerSelectedFieldsByTableId(this.selectedFieldsByTableId);
  }
}
