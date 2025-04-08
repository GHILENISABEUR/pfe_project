import { Component, Input, OnInit } from '@angular/core';
import { S_TableService } from 'src/app/GestionAuth/services/TableService/Table.service';
import { S_SharedDataService } from '../../services/sharedData/shared-data.service';

@Component({
  selector: 'app-data-table-form',
  templateUrl: './data-table-form.component.html',
  styleUrls: ['./data-table-form.component.css']
})
export class DataTableFormComponent implements OnInit {
  @Input() selectedFieldsByTableId: { [tableId: string]: { id: string; name: string; data: any[] }[] } = {};

  tables: any[] = [];
  selectedTables: any[] = [];
  fields: any[] = [];
  fieldsByTableId: { [tableId: string]: any[] } = {};
  currentPage: number = 1;
  pageSize: number = 1;
  totalPages: number = 1;
  currentData: { [tableId: string]: { [fieldId: string]: any[] } } = {};
  combinedDetailsData: any[] = []; // Array to store combined details data

  constructor(
    private V_tableService: S_TableService,
    private V_sharedDataService: S_SharedDataService
  ) {}

  ngOnInit() {
    this.TS_loadAllTables();
  }

  TS_objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  TS_loadAllTables(): void {
    this.V_tableService.S_getAllTables().subscribe((tables) => {
      this.tables = tables;
      const selectedTablesIds = Object.keys(this.selectedFieldsByTableId).map(id => parseInt(id, 10));
      this.selectedTables = this.tables.filter((table) => selectedTablesIds.includes(table.id));
      this.tables.forEach((table) => {
        const numericTableId = parseInt(table.id, 10);
        if (this.selectedTables.some((t) => parseInt(t.id, 10) === numericTableId)) {
          this.TS_loadData(table.id);
        }
      });
      this.TS_createData();
    });
  }

  TS_loadData(tableId: string): void {
    const numericTableId = parseInt(tableId, 10);
    this.V_tableService.S_getDataByTable(numericTableId).subscribe((data) => {
      const selectedFieldsData = this.TS_getSelectedFieldsData(tableId, data);
      this.TS_updateTotalPages(tableId);
    });
  }

  TS_getSelectedFieldsData(tableId: string, data: any[]): any[] {
    const selectedFields = this.selectedFieldsByTableId[tableId];
    return selectedFields.map((field) => ({
      id: field.id,
      name: field.name,
      data: data.map((item) => item[field.name]),
    }));
  }

  TS_currentDataForField(tableId: string, fieldId: string): any[] {
    const fieldData = this.selectedFieldsByTableId[tableId].find(f => f.id === fieldId)?.data;
    if (!fieldData) return [];
    const pageIndex = (this.currentPage - 1) * this.pageSize;
    return [fieldData[pageIndex]]; // Return only the current data item in a new array
  }

  TS_updateTotalPages(tableId: string): void {
    const maxDataLength = Math.max(...this.selectedFieldsByTableId[tableId].map(field => field.data.length));
    this.totalPages = Math.ceil(maxDataLength / this.pageSize);
  }

  TS_nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  TS_previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  TS_createData() {
    const tableIds = this.TS_objectKeys(this.selectedFieldsByTableId);
    let maxRows = 0;
    tableIds.forEach(tableId => {
      const field = this.selectedFieldsByTableId[tableId][0];
      maxRows = Math.max(maxRows, field.data.length);
    });

    for (let i = 0; i < maxRows; i++) {
      const rowData: any = {};
      tableIds.forEach(tableId => {
        const fields = this.selectedFieldsByTableId[tableId];
        fields.forEach(field => {
          const details = (field.data[i] && field.data[i].details) || {};
          rowData[field.name] = details[field.name] || '';
        });
      });
      this.combinedDetailsData.push(rowData);
    }
    this.TS_shareData();
  }

  TS_shareData() {
    this.V_sharedDataService.registerDataTableFieldsData(this.combinedDetailsData, "data-form");
    this.V_sharedDataService.registerSelectedFieldsByTableId(this.selectedFieldsByTableId);
  }
}