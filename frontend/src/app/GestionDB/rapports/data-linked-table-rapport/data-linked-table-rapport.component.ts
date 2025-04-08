

import { Component, Input, OnInit } from '@angular/core';
import { S_TableService } from '../../services/TableService/Table.service'; 
import { Observable, forkJoin, map } from 'rxjs';
import { S_SharedDataService } from '../../services/sharedData/shared-data.service'; 
@Component({
  selector: 'app-data-linked-table-rapport',
  templateUrl: './data-linked-table-rapport.component.html',
  styleUrls: ['./data-linked-table-rapport.component.css']
})
export class DataLinkedTableRapportComponent implements OnInit {
  @Input() selectedFieldsByTableId: { [tableId: string]: { id: string; name: string; data: any[] }[] } = {};

  tables: any[] = [];
  fields: any[] = [];
  fieldsByTableId: { [tableId: string]: any[] } = {};
  selectedFields: any[] = [];
  joinedData: any[] = [];
  commonKeys: string[] = [];
  displayedFields: string[] = [];
  join=false;

  constructor(private V_tableService: S_TableService, private V_sharedDataService:S_SharedDataService) {}

  ngOnInit() {
    console.log("this.selectedFieldsByTableId",this.selectedFieldsByTableId)
    this.V_tableService.S_getAllTables().subscribe((tables) => {
      this.tables = tables;
      const selectedTablesId = this.TS_objectKeys(this.selectedFieldsByTableId);
      console.log("selectedTablesId",selectedTablesId)
      const selectedTablesNames = this.tables
      .filter(table => selectedTablesId.includes(table.id)) // Assuming 'id' is the property containing the table ID
      .map(table => table.name); // Assuming 'name' is the property containing the table name
      if (selectedTablesId.length < 2) {
        console.error('At least two tables must be selected to perform a join.');
        return;
      }
     //find common keys between the chosen tables
      this.V_tableService.S_findCommonKeys(selectedTablesId).subscribe((keys) => {
        this.commonKeys = keys;
        console.log('Common keys', this.commonKeys);
          this.TS_loadAllFields();
          this.TS_joinData();

      });

      });

  }

  TS_loadAllFields(): void {
    this.V_tableService.S_getAllFields().subscribe((fields) => {
      this.fields = fields;
      console.log("TS_loadAllField",this.fields)

      this.TS_mapFieldsByTableId();
    });
  }

  TS_mapFieldsByTableId(): void {
    for (const field of this.fields) {
      if (!this.fieldsByTableId[field.tableId]) {
        this.fieldsByTableId[field.tableId] = [];
      }
      this.fieldsByTableId[field.tableId].push(field);
    }
    console.log('Mapped fields by table ID:', this.fieldsByTableId);
  }

  TS_objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  TS_joinData(): void {
    const selectedTablesId = this.TS_objectKeys(this.selectedFieldsByTableId);
    console.log('Selected tables ID:', selectedTablesId);
    const selectedTablesNames = this.tables.filter(table => selectedTablesId.includes(table.id.toString())).map(table => table.name);
    console.log("selected tables names",selectedTablesNames);
    if (selectedTablesId.length < 2) {
      console.error('At least two tables must be selected to perform a join.');
      return;
    }
    if (this.commonKeys.length === 0) {
      console.error('There are no common keys between the two tables.');
      return;
    }
    this.selectedFields = selectedTablesId.map((tableId) => this.selectedFieldsByTableId[tableId]).flat().map((field) => field.name);
    console.log('Selected fields:', this.selectedFields);
    console.log("this.fields",this.fields)
    const commonKeysNames=this.fields.filter(field=>this.commonKeys.includes(field.id)).map(field=>field.name);
    console.log("common keys names",commonKeysNames);
    this.V_tableService.S_dynamicJoinedData(selectedTablesNames, this.selectedFields, commonKeysNames).subscribe((data) => {
      this.joinedData = data;
      console.log('Joined data:', this.joinedData);
      this.TS_shareData();
    });



  }

  TS_shareData(){
    this.V_sharedDataService.registerDataTableFieldsData(this.joinedData,"linked-table");

    console.log("selected fields by table Id",this.selectedFieldsByTableId);
    console.log("data shared",this.joinedData);
    this.V_sharedDataService.registerSelectedFieldsByTableId(this.selectedFieldsByTableId);
  }
}

