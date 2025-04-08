//niv 7 excel-list
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel-list',
  templateUrl: './excel-list.component.html',
  styleUrls: ['./excel-list.component.css']
})
export class ExcelListComponent {
  selectedFile: File | null = null;
  sheetNames: string[] = []; // Store sheet names
  selectedSheetName: string | null = null; // Store selected sheet name
  columns: string[] = [];
  selectedColumnName: string | null = null;
  columnPreview: string[] = [];

  constructor(private dialogRef: MatDialogRef<ExcelListComponent>) { }



  TS_onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.readAsBinaryString(this.selectedFile);

      reader.onload = () => {
        const data = reader.result as string;
        const workbook = XLSX.read(data, { type: 'binary' });
        this.sheetNames = workbook.SheetNames; // Populate sheet names
      };

      reader.onerror = (error) => {
        console.error('Error reading excel file', error);
      };
    }
  }

  TS_onSheetChange(event: any) {
    this.selectedSheetName = event.target.value;
    if (this.selectedFile && this.selectedSheetName) {
      const reader = new FileReader();
      reader.readAsBinaryString(this.selectedFile);

      reader.onload = () => {
        const data = reader.result as string;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[this.selectedSheetName!]; // Use non-null assertion for selectedSheetName

        // Use type assertion here
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (json.length > 0) {
          // Use type assertion to ensure the first row is treated as an array of any values
          this.columns = json[0].map((value) => String(value)); // Convert each value to string
        }
      };

      reader.onerror = (error) => {
        console.error('Error processing excel file', error);
      };
    }
  }


  TS_onColumnChange(event: any) {
    this.selectedColumnName = event.target.value;
    if (this.selectedFile && this.selectedSheetName && this.selectedColumnName) {
      const reader = new FileReader();
      reader.readAsBinaryString(this.selectedFile);

      reader.onload = () => {
        const data = reader.result as string;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[this.selectedSheetName!]; // Non-null assertion for selectedSheetName
        const json = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        // Populate the columnPreview with the values of the selected column
        this.columnPreview = json.map((row: any) => row[this.selectedColumnName!] || ''); // Use non-null assertion for selectedColumnName
      };

      reader.onerror = (error) => {
        console.error('Error processing excel file', error);
      };
    }
  }

  TS_uploadAndProcess() {
    if (this.selectedFile && this.selectedSheetName && this.selectedColumnName) {
      const reader = new FileReader();
      reader.readAsBinaryString(this.selectedFile);

      reader.onload = () => {
        const data = reader.result as string;
        const workbook = XLSX.read(data, { type: 'binary' });

        const worksheet = workbook.Sheets[this.selectedSheetName!]; // Non-null assertion for selectedSheetName
        const json = XLSX.utils.sheet_to_json(worksheet);

        const selectedColumnValues = json.map((row: any) => row[this.selectedColumnName!]); // Non-null assertion for selectedColumnName
        this.TS_confirmSelection(selectedColumnValues);
      };

      reader.onerror = (error) => {
        console.error('Error reading excel file', error);
      };
    }
  }

  TS_confirmSelection(selectedColumnValues: string[]) {
    this.dialogRef.close(selectedColumnValues);
  }

  TS_closeDialog(): void {
    this.dialogRef.close();
  }

}