import { Component, EventEmitter, Output ,Inject} from '@angular/core';
import { S_TableService } from '../../services/TableService/Table.service';
import { S_CategoryService } from '../../services/categService/Category.service';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
//Niv 3 conception foreign key
@Component({
  selector: 'app-foreign-key',
  templateUrl: './foreign-key.component.html',
  styleUrls: ['./foreign-key.component.css']
})
export class ForeignKeyComponent {
    categories: any[] = [];
    tables: any[] = [];
    fields: any[] = [];
    selectedTable: any;
    selectedField: any;
    selectedCategory: any;
    tableIdSelected: any;
    websiteId:any;
    @Output() selectedColumn=new EventEmitter<string[]>();
    @Output() selectedTableName=new EventEmitter<string[]>();
    @Output() referredFieldId = new EventEmitter<number>();

    constructor(private V_tableService:S_TableService ,private V_categoryService:S_CategoryService,public dialogRef: MatDialogRef<ForeignKeyComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any ) { }
    ngOnInit() {

      this.TS_loadCategories();
    }

    TS_loadCategories(): void {
      this.V_categoryService.getCategoriesByWebsiteId(this.data.websiteId).subscribe(categories => {
        this.categories = categories;
      });
    }

    TS_onCategorySelected(): void {
      this.V_tableService.S_getTablesByCategoryId(this.selectedCategory.id).subscribe(tables => {
        // this.tables = tables;
        this.tables = tables.map(table => {
          return {
              ...table,
              name: table.name.replace(`_${this.data.websiteId}`, '') // Retirer l'ID du site Web
          };
      });
        this.selectedTable = null;
        this.fields = [];
      });
    }

    TS_onTableSelected(): void {
      this.V_tableService.S_getFieldsByTable(this.selectedTable.id).subscribe(fields => {
        this.fields = fields;
        this.selectedField = null;
        this.tableIdSelected.emit(this.selectedTable.name); // Emit selected table ID

      });
    }
    TS_onFieldSelected(): void {

      if (this.selectedField && this.selectedTable) {
        console.log("column Name",this.selectedField.name);
        this.selectedColumn.emit(this.selectedField.name);
        this.selectedTableName.emit(this.selectedTable.name);
        this.referredFieldId.emit(this.selectedField.id);
        const tableNameWithWebsiteId = `${this.selectedTable.name}_${this.data.websiteId}`;

        console.log("table Name",tableNameWithWebsiteId);
      }
    }
    TS_closeDialog(): void {
      if (this.selectedField && this.selectedTable) {
        const result = {
          field: this.selectedField,
          table: this.selectedTable,
          category: this.selectedCategory
        };
        this.dialogRef.close(result); // Return data on save
      } else {
        this.dialogRef.close(null); // Return null if no data
      }
    }

}