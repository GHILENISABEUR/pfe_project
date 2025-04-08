import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { S_VisualService } from 'src/app/GestionDB/services/visualService/visual.service';
import { VisualPopupComponent } from 'src/app/GestionDB/rapports/visual-popup/visual-popup.component';
import { S_CategoryService } from 'src/app/GestionDB/services/categService/Category.service';
import { S_TableService } from 'src/app/GestionAuth/services/TableService/Table.service';
@Component({
  selector: 'app-data-bd',
  templateUrl: './data-bd.component.html',
  styleUrls: ['./data-bd.component.css']
})
export class DataBDComponent implements OnInit {
  selectedDataSourceType!: string;

  websiteId!: number;
  visuals: any[] = [];
  selectedVisual: any;
  visualToShow: any; // Le visual à afficher dans le composant VisualPopupComponent
  categories: any[] = [];
  tables: any[] = [];
  fields: any[] = [];
  selectedTable: any;
  selectedCategory:any;
  tableIdSelected: any;

  constructor(
    private V_categoryService:S_CategoryService,
    private V_tableService:S_TableService,
    private visualService: S_VisualService,
    public dialogRef: MatDialogRef<DataBDComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit(): void {
   this.websiteId=this.data.websiteId;
      this.TS_loadVisuals();
      this.TS_loadCategories();

  }
  TS_loadVisuals(): void {
    this.visualService.S_getVisualsByWebsiteId(this.websiteId).subscribe(visuals => {
      this.visuals = visuals;
    });
  }

  TS_onVisualChange(selectedVisual: any): void {
    this.dialogRef.close(selectedVisual.value); // Ferme la popup et renvoie le visual sélectionné
  }

  TS_closeDialog(): void {
    this.dialogRef.close(); // Ferme la popup sans renvoyer de valeur
  }
  TS_loadCategories(): void {
    this.V_categoryService.getCategoriesByWebsiteId(this.data.websiteId).subscribe(categories => {
      this.categories = categories;
    });
  }

  TS_onCategorySelected(event: any): void {
    const category = event.value;

    this.V_tableService.S_getTablesByCategoryId(category.id).subscribe(tables => {
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
      if (this.dialogRef) {
        this.dialogRef.close({ selectedTable: this.selectedTable, fields: this.fields }); // Émet les données lorsque le popup se ferme
      }
    });
  }
  TS_onDataSourceTypeChange(event: any): void {
    if (event.value === 'category') {
      this.selectedCategory = null;
      this.selectedVisual = null;
    } else if (event.value === 'visual') {
      this.selectedCategory = null;
      this.selectedVisual = null;
    }
  }
  TS_saveAndClose(): void {
    if (this.dialogRef) {
      if (this.selectedVisual) {
        this.dialogRef.close({ visualData: this.selectedVisual });
      } else if (this.selectedTable && this.fields) {
        this.dialogRef.close({ selectedTable: this.selectedTable, fields: this.fields });
      } else {
        this.dialogRef.close();
      }
    }
  }
}
