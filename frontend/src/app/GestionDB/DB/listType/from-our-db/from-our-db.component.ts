//niv 7 from-our-db

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { S_TableService } from 'src/app/GestionAuth/services/TableService/Table.service';
import { S_CategoryService } from 'src/app/GestionAuth/services/categService/Category.service';

@Component({
  selector: 'app-from-our-db',
  templateUrl: './from-our-db.component.html',
  styleUrls: ['./from-our-db.component.css']
})
export class FromOurDBComponent implements OnInit {
  @Output() listValuesUpdated = new EventEmitter<string[]>();
  @Output() tableIdSelected = new EventEmitter<number>();
  @Output() fieldIdSelected = new EventEmitter<number>();

  categories: any[] = [];
  selectedCategory: any;
  tables: any[] = [];
  selectedTable: any;
  fields: any[] = [];
  selectedField: any;
  lastSelectedListValues: string[] = [];
  relatedFields: any[] = [];
  VarS_newValue: string = ''; // For manual input

  constructor(
    public dialogRef: MatDialogRef<FromOurDBComponent>,
    private V_tableService: S_TableService,
    private V_categoryService: S_CategoryService
  ) {}

  ngOnInit() {
    this.TS_loadCategories();
  }

  TS_loadCategories(): void {
    this.V_categoryService.S_getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  TS_onCategorySelected(): void {
    this.V_tableService.S_getTablesByCategoryId(this.selectedCategory.id).subscribe(tables => {
      this.tables = tables;
      this.selectedTable = null;
      this.fields = [];
    });
  }

  TS_onTableSelected(): void {
    this.V_tableService.S_getFieldsByTable(this.selectedTable.id).subscribe(fields => {
      this.fields = fields;
      this.selectedField = null;
      this.tableIdSelected.emit(this.selectedTable.id);
    });
  }

  TS_onFieldSelected(): void {
    if (this.selectedField && this.selectedTable) {
      this.V_tableService.S_getDataForField(this.selectedTable.id, this.selectedField.id).subscribe(data => {
        console.log('Raw data:', data);

        const listValues = data.map(d => d.details && d.details[this.selectedField.name]);
        console.log('Mapped listValues:', listValues);

        this.lastSelectedListValues = listValues;
        this.listValuesUpdated.emit(listValues);

        if (this.selectedField.type === 'List') {
          this.TS_loadRelatedFields(this.selectedField.id);
        }
        this.fieldIdSelected.emit(this.selectedField.id);
      });
    }
  }

  TS_loadRelatedFields(fieldId: number): void {
    this.V_tableService.S_getRelatedFieldsByListFieldId(fieldId).subscribe(relatedFields => {
      this.relatedFields = relatedFields;
      console.log('Related fields:', relatedFields);
    });
  }

  // Add new value manually
  TS_addValue(): void {
    const trimmedValue = this.VarS_newValue.trim();
    if (trimmedValue && !this.lastSelectedListValues.includes(trimmedValue)) {
      this.lastSelectedListValues.push(trimmedValue);
      this.VarS_newValue = '';
    }
  }

  // Remove value from the list
  TS_removeValue(index: number): void {
    if (index >= 0 && index < this.lastSelectedListValues.length) {
      this.lastSelectedListValues.splice(index, 1);
    }
  }

  // Save and close dialog
  TS_saveData(): void {
    // Emit the current list values, even if it's empty
    this.listValuesUpdated.emit(this.lastSelectedListValues);
    // Close the dialog and pass the list values
    this.dialogRef.close(this.lastSelectedListValues);
  }
  // Close without saving
  TS_cancel(): void {
    this.dialogRef.close();
  }
}
