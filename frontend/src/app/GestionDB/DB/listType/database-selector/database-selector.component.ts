import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExternalDBService } from 'src/app/GestionDB/services/externalDbService/external-db.service';

@Component({
  selector: 'app-database-selector',
  templateUrl: './database-selector.component.html',
  styleUrls: ['./database-selector.component.css']
})
export class DatabaseSelectorComponent {
  VarTab_tables: string[] = [];
  VarS_fields: string[] = [];  // Corrected this line
  VarS_selectedTable: string = '';
  VarS_selectedField: string = '';
  VarTab_connectionDetails: any;
  VarS_values = new EventEmitter<string[]>();

  constructor(
    private TS_dialogRef: MatDialogRef<DatabaseSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public VarTab_data: any,
    private TS_Sce_externalDBService: ExternalDBService
  ) {
    this.VarTab_connectionDetails = VarTab_data.connectionDetails;
  }

  ngOnInit(): void {
    console.log(this.VarTab_connectionDetails);
    this.TS_Sce_fetchTables();
  }

  TS_Sce_fetchTables(): void {
    console.log('Tables retrieved:', this.VarTab_tables);

    this.TS_Sce_externalDBService.getTablesFromDatabase(this.VarTab_connectionDetails).subscribe(
      (VarTab_tables: string[]) => {
        this.VarTab_tables = VarTab_tables;
      },
      (VarS_error) => {
        console.error('Error fetching tables:', VarS_error);
      }
    );
  }

  TS_Sce_fetchFields(): void {
    this.TS_Sce_externalDBService.getFieldsFromTable(this.VarTab_connectionDetails, this.VarS_selectedTable).subscribe(
      (VarS_fields: string[]) => { 
        this.VarS_fields = VarS_fields; 
      },
      (VarS_error) => {
        console.error('Error fetching fields:', VarS_error);
      }
    );
  }

  TS_Sce_fetchValues(): void {
    this.TS_Sce_externalDBService.getValuesFromField(this.VarTab_connectionDetails, this.VarS_selectedTable, this.VarS_selectedField).subscribe(
      (VarS_values: string[]) => {
        console.log('Values retrieved:', VarS_values);
        this.VarS_values.emit(VarS_values);
        this.TS_dialogRef.close(VarS_values);
      },
      (VarS_error) => {
        console.error('Error fetching values:', VarS_error);
      }
    );
  }

  TS_closeDialog(): void {
    this.TS_dialogRef.close();
  }
}
