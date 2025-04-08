import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExternalDBService } from '../../services/externalDbService/external-db.service'; 

@Component({
  selector: 'app-select-table',
  templateUrl: './select-table.component.html',
  styleUrls: ['./select-table.component.css']
})
export class SelectTableComponent {
  tables: string[] = [];
  connectionDetails: any;
  selectedTable: string = '';
  table = new EventEmitter<string>();

  constructor(
    private dialogRef: MatDialogRef<SelectTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private externalDBService: ExternalDBService
  ) {
    this.connectionDetails = data.connectionDetails;
  }

  ngOnInit(): void {
    console.log(this.connectionDetails);
    this.TS_Sce_fetchTables();
  }

  TS_Sce_fetchTables(): void {
    console.log('Tables retrieved:', this.tables);

    this.externalDBService.getTablesFromDatabase(this.connectionDetails).subscribe(
      (tables: string[]) => {
        this.tables = tables;
      },
      (error) => {
        console.error('Error fetching tables:', error);
      }
    );
  }

  TS_closeDialog(): void {
    this.dialogRef.close();
  }

  TS_selectTable(): void {
    this.table.emit(this.selectedTable);
    console.log('Selected Table:', this.selectedTable);
    this.TS_closeDialog();
  }
}
