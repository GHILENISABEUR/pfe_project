import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
//niv 7 pred-val
@Component({
  selector: 'app-pred-val',
  templateUrl: './pred-val.component.html',
  styleUrls: ['./pred-val.component.css']
})
export class PredValComponent {
  VarS_newValue: string = '';
  VarS_values: string[] = [];

  constructor(public dialogRef: MatDialogRef<PredValComponent>) {}

  // Add new value to the list
  TS_addValue(): void {
    const trimmedValue = this.VarS_newValue.trim();
    if (trimmedValue) {
      // Check for duplicates before adding
      if (!this.VarS_values.includes(trimmedValue)) {
        this.VarS_values.push(trimmedValue);
        this.VarS_newValue = '';
      }
    }
  }

  // Remove value from the list
  TS_removeValue(index: number): void {
    if (index >= 0 && index < this.VarS_values.length) {
      this.VarS_values.splice(index, 1);
    }
  }

  // Save and close dialog
  TS_saveData(): void {
    if (this.VarS_values.length > 0) {
      this.dialogRef.close(this.VarS_values);
    }
  }

  // Close without saving
  TS_cancel(): void {
    this.dialogRef.close();
  }
}