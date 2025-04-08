import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatabaseSelectorComponent } from '../listType/database-selector/database-selector.component';
import { SelectTableComponent } from '../select-table/select-table.component';
import { ExternalDBService } from '../../services/externalDbService/external-db.service'; 
@Component({
  selector: 'app-connection-db',
  templateUrl: './connection-db.component.html',
  styleUrls: ['./connection-db.component.css']
})
export class ConnectionDBComponent {
  databaseForm: FormGroup;
  @Output() values = new EventEmitter<string[]>();
  tableName: EventEmitter<string> = new EventEmitter<string>();
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DatabaseSelectorComponent>,
    private dialog: MatDialog,
    private V_externalDBService: ExternalDBService

  ) {
    this.databaseForm = this.fb.group({
      databaseName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      host: ['', Validators.required],
      port: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.databaseForm.valid) {
      const connectionDetails = this.databaseForm.value;
      this.dialogRef.close();
      this.openDatabaseSelectorDialog(connectionDetails);
      this.closeDialog();
    }
  }

  openDatabaseSelectorDialog(connectionDetails: any): void {
    const dialogRef = this.dialog.open(SelectTableComponent, {
      data: { connectionDetails }
    });
    dialogRef.componentInstance.table.subscribe((table: string) => {
      console.log('table:',table);

      this.V_externalDBService.S_getTableFromDatabase(connectionDetails,table).subscribe((data)=>{
        console.log('Data:',data);
        this.values.emit(data);
        this.tableName.emit(table);
        this.closeDialog();



      }
      );

    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
