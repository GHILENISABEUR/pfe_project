import { Component, Input, OnInit } from '@angular/core';
import { S_TableService } from '../../services/TableService/Table.service';
import { S_SharedDataService } from '../../services/sharedData/shared-data.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-linked-table-form',
  templateUrl: './linked-table-form.component.html',
  styleUrls: ['./linked-table-form.component.css']
})
export class LinkedTableFormComponent implements OnInit {

  @Input() selectedFieldsByTableId: { [tableId: string]: { id: string; name: string; data: any[] }[] } = {};
 @Input() idweb:any;
  tables: any[] = [];
  fields: any[] = [];
  fieldsByTableId: { [tableId: string]: any[] } = {};
  selectedFields: any[] = [];
  joinedData: any[] = [];
  filteredData: any[] = [];
  uniqueTableData: { [tableId: string]: any[] } = {};
  commonKeys: string[] = [];
  displayedFields: string[] = [];
  join = false;
  currentRowIndex = 0;
  tableIdToNameMap: { [key: string]: string } = {};
  websiteId:any;
  constructor(private V_tableService: S_TableService,private route: ActivatedRoute, private V_sharedData: S_SharedDataService,private V_sharedDataService:S_SharedDataService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ",this.websiteId )
     });


    this.V_tableService.S_getAllTables().subscribe((tables) => {
      this.tables = tables;
      for (const key in this.tableIdToNameMap) {
        if (this.tableIdToNameMap.hasOwnProperty(key)) {
          this.tableIdToNameMap[key] = this.tableIdToNameMap[key].replace(`_${this.websiteId}`, '');
        }
      }


      this.tables.forEach(table => {
        this.tableIdToNameMap[table.id] = table.name.replace(`_${this.websiteId}`, '');
      });
      const selectedTablesId = this.TS_objectKeys(this.selectedFieldsByTableId);
      const selectedTablesNames = this.tables
        .filter(table => selectedTablesId.includes(table.id)) // Assuming 'id' is the property containing the table ID
        .map(table => table.name); // Assuming 'name' is the property containing the table name
      if (selectedTablesId.length < 2) {
        console.error('At least two tables must be selected to perform a join.');
        return;
      }

      // Find common keys between the chosen tables
      this.V_tableService.S_findCommonKeys(selectedTablesId).subscribe((keys) => {
        this.commonKeys = keys;
        console.log('Common keys', this.commonKeys);
        this.TS_loadAllFields();
        this.TS_joinData();
      });
    });


  }
  transformTableName(name: string): string {
    console.log("this.websiteId",this.idweb)
    console.log("change",name.replace(`_${this.idweb}`, ''))
    return name.replace(`_${this.idweb}`, '');
  }
  // Load all fields from the database
  TS_loadAllFields(): void {
    this.V_tableService.S_getAllFields().subscribe((fields) => {
      this.fields = fields;
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
    console.log("selected tables names", selectedTablesNames);
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
    const commonKeysNames = this.fields.filter(field => this.commonKeys.includes(field.id)).map(field => field.name);
    console.log("common keys names", commonKeysNames);
    this.V_tableService.S_dynamicJoinedData(selectedTablesNames, this.selectedFields, commonKeysNames).subscribe((data) => {
      this.joinedData = data;
      this.filteredData = data; // Initialize filteredData with all joinedData
      this.TS_computeUniqueTableData();
      console.log('Joined data:', this.joinedData);
      this.TS_shareData();

    });
  }

  // Compute unique data for each table
  TS_computeUniqueTableData(): void {
    this.uniqueTableData = {};
    for (const tableId of Object.keys(this.selectedFieldsByTableId)) {
      this.uniqueTableData[tableId] = [];
      const tableFields = this.selectedFieldsByTableId[tableId].map(field => field.name.toLowerCase());
      const uniqueRows = new Set<string>();
      for (const row of this.filteredData) {
        const uniqueKey = tableFields.map(field => row[field]).join('|');
        if (!uniqueRows.has(uniqueKey)) {
          uniqueRows.add(uniqueKey);
          this.uniqueTableData[tableId].push(row);
        }
      }
    }
    console.log('Unique data for each table:', this.uniqueTableData);
  }

  // Filter the data based on the clicked field value
  TS_filterData(fieldName: string, value: any): void {
    this.filteredData = this.joinedData.filter(row => row[fieldName.toLowerCase()] === value);
    this.TS_computeUniqueTableData();
    console.log(`Filtered data by ${fieldName} = ${value}:`, this.filteredData);
  }
  TS_resetFilter(): void {
    this.filteredData = this.joinedData;
    this.TS_computeUniqueTableData();
    console.log('Filtered data reset:', this.filteredData);
  }
  TS_shareData(){
    this.V_sharedDataService.registerDataTableFieldsData(this.joinedData, 'linked-form');
    console.log("shared data",this.joinedData);
    console.log("linked form");
    this.V_sharedDataService.registerSelectedFieldsByTableId(this.selectedFieldsByTableId);

  }
}
