import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PredValComponent } from '../pred-val/pred-val.component';
import { ExcelListComponent } from '../excel-list/excel-list.component';
import { FromOurDBComponent } from '../from-our-db/from-our-db.component';
import { FromDBDialogComponent } from '../from-dbdialog/from-dbdialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  @Output() listValuesUpdated = new EventEmitter<string[]>();
  VarS_currentListValues: string[] = [];
  @Output() tableIdSelected = new EventEmitter<number>();
  @Output() fieldIdSelected = new EventEmitter<number>();

  constructor(public dialog: MatDialog) { }

  TS_openPredValDialog() {
    const TS_dialogRef = this.dialog.open(PredValComponent, {
      width: '400px',
      height: '350px'
    });

    TS_dialogRef.afterClosed().subscribe(VarS_result => {
      console.log('Predefined values dialog was closed', VarS_result);
      if (VarS_result) {
        this.VarS_currentListValues = VarS_result;
        this.listValuesUpdated.emit(this.VarS_currentListValues);
      }
    });
  }

  TS_openExcelListDialog() {
    const TS_dialogRef = this.dialog.open(ExcelListComponent, {
      width: '400px',
      height: '350px'
    });

    TS_dialogRef.afterClosed().subscribe(VarS_result => {
      console.log('Excel List dialog was closed', VarS_result);
      if (VarS_result) {
        this.VarS_currentListValues = VarS_result;
        this.listValuesUpdated.emit(this.VarS_currentListValues);
      }
    });
  }

  TS_openFromOurDBDialog() {
    const TS_dialogRef = this.dialog.open(FromOurDBComponent, {
      width: '400px',
      height: '350px'
    });

    TS_dialogRef.componentInstance.tableIdSelected.subscribe((VarN_tableId: number) => {
      console.log('Selected Table ID:', VarN_tableId);
      this.tableIdSelected.emit(VarN_tableId);
    });

    TS_dialogRef.componentInstance.fieldIdSelected.subscribe((VarN_fieldId: number) => {
      console.log('Selected Field ID:', VarN_fieldId);
      this.fieldIdSelected.emit(VarN_fieldId);
    });

    TS_dialogRef.afterClosed().subscribe(VarS_result => {
      console.log('From our Database dialog was closed', VarS_result);
      if (VarS_result && VarS_result.length > 0) {
        this.VarS_currentListValues = VarS_result; // Update the currentListValues with the result
        this.listValuesUpdated.emit(this.VarS_currentListValues); // Emit the updated list values
        console.log('Current list values:', this.VarS_currentListValues); // Log the current list values (for verification)
      }
    });
  }

  TS_openFromDBDialog() {
    const TS_dialogRef = this.dialog.open(FromDBDialogComponent, {
      width: '600px', // Adjust width and height as needed
      height: '400px',
      data: {} // You can pass data to the dialog if needed
    });

    TS_dialogRef.componentInstance.VarS_values.subscribe((VarS_values: string[]) => {
      console.log('Values received:', VarS_values);
      this.VarS_currentListValues = VarS_values;
      this.listValuesUpdated.emit(this.VarS_currentListValues);
    }, (VarS_error: any) => {
      console.error('Error fetching values:', VarS_error);
    });
  }
}
