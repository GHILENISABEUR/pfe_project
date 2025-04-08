import { Component, Input, OnInit } from '@angular/core';
import { S_TableService } from '../../services/TableService/Table.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rapport-tables',
  templateUrl: './rapport-tables.component.html',
  styleUrls: ['./rapport-tables.component.css']
})
export class RapportTablesComponent implements OnInit {
  tables: any[] = [];
  fields: any[] = [];
  fieldsByTable: { [tableId: string]: any[] } = {};
  offsetX: number = 0;
  offsetY: number = 0;
  selectedFieldsByTableId: { [tableId: string]: { id: string; name: string; data: any[] }[] } = {};
  selectedTableName: string | null = null;
  @Input() selectedTables: any[] = [];
  websiteId?:number;

  constructor(private V_tableService: S_TableService,private route:ActivatedRoute) {

  }

  ngOnInit() {
    this.TS_loadAllTables();
    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ",this.websiteId )
     });
  }

  TS_loadAllTables(): void {
    this.V_tableService.S_getAllTables().subscribe((tables) => {
      this.tables = tables;


    });
  }

  TS_selectTable(tableName: string): void {
    this.selectedTableName = tableName; // Store the selected table name
    const tableNameWithWebsiteId = `${tableName}_${this.websiteId}`;

    this.V_tableService.S_getAllTables().subscribe(allTables => {
      const selectedTable = allTables.find(tab => tab.name === tableNameWithWebsiteId);

      if (selectedTable) {
        this.TS_loadFieldsForTable(selectedTable.id);
      } else {
        console.error('Table not found:', tableName);
      }
    });
  }


  TS_loadFieldsForTable(tableId: string): void {
    this.V_tableService.S_getFieldsByTable(parseInt(tableId, 10)).subscribe((fields) => {
      this.tables =this. tables.map(table => {
        return {
            ...table,
            name: table.name.replace(`_${this.websiteId}`, '') // Retirer l'ID du site Web
        };
    });
      const tableName= this.tables.find(tab => tab.id === parseInt(tableId, 10))?.name;
      this.fieldsByTable[tableName] = fields;
      console.log('Loaded fields for table with ID', tableId, ':', fields);});

  }
  TS_loadData(tableId: any): void {
    this.V_tableService.S_getDataByTable(tableId).subscribe((data) => {
      // Assuming you have a method to determine selected fields and their data
      const selectedFieldsData = this.TS_getSelectedFieldsData(tableId, data);
      this.selectedFieldsByTableId[tableId] = selectedFieldsData;
      console.log(
        'Loaded data for table with ID',
        tableId,
        ':',
        selectedFieldsData
      );
    });
    console.log('Loading data for table ID:', tableId);

  }

  TS_getSelectedFieldsData(tableId: string, data: any[]): any[] {
    const selectedFields = this.fieldsByTable[tableId];
    if (!selectedFields) {
      console.error('No selected fields available for tableId:', tableId);
      return []; // Return an empty array to prevent runtime errors
    }
    return selectedFields.map((field) => ({
      id: field.id,
      name: field.name,

      data: data.map((item) => item.details && item.details[field.name] ? item.details[field.name] : 'N/A'),
    }));
    console.log('Selected fields data hello:', selectedFields);
  }



  TS_selectField(event: MouseEvent, field: any, table: any): void {
    event.stopPropagation(); // Prevent click event from bubbling up to the parent
  }

  TS_isFieldSelected(field: any, table: any): boolean {
    const tableId=this.tables.find(tab => tab.name === table)?.id;
    return (
      this.selectedFieldsByTableId[tableId]?.some((f) => f.id === field.id) ??
      false
    );
  }
  TS_toggleFieldSelection(event: Event, field: any, table: any): void {
    const tableId=this.tables.find(tab => tab.name === table)?.id;
    event.stopPropagation();
    const selectedFields = this.selectedFieldsByTableId[tableId] || [];
    const fieldIndex = selectedFields.findIndex((f) => f.id === field.id);

    if (fieldIndex > -1) {
        selectedFields.splice(fieldIndex, 1);
    } else {
        selectedFields.push({ id: field.id, name: field.name, data: [] });
        this.TS_fetchFieldData(tableId, field.id);
    }
    this.selectedFieldsByTableId[tableId] = [...selectedFields];
    console.log('Selected fields:', this.selectedFieldsByTableId);
}


TS_fetchFieldData(tableId: string, fieldId: string): void {
    this.V_tableService.S_getDataForField(parseInt(tableId, 10), parseInt(fieldId, 10)).subscribe(data => {
      const field = this.selectedFieldsByTableId[parseInt(tableId, 10)].find(f => f.id === fieldId);
      if (field) {
        field.data = data;
      }
    });



  }


  TS_dragStart(event: DragEvent): void {
    const target = event.target as HTMLElement | null;
    if (target) {
      const rect = target.getBoundingClientRect();
      this.offsetX = event.clientX - rect.left;
      this.offsetY = event.clientY - rect.top;
    }
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  }

  TS_dragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement | null;
    if (target) {
      const x = event.clientX - this.offsetX;
      const y = event.clientY - this.offsetY;
      target.style.position = 'absolute';
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
    }
  }
}
