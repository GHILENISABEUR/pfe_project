import { Component, Input, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { S_TableService } from '../../services/TableService/Table.service'; 
import { forkJoin } from 'rxjs';
//Niv 6 excel tab
@Component({
  selector: 'app-excel-tab',
  templateUrl: './excel-tab.component.html',
  styleUrls: ['./excel-tab.component.css']
})
export class ExcelTabComponent implements OnInit {
  @Input() selectedTable: any;
  @Input() fields!: any[];
  data: any[] = [];
  headers: string[] = [];
  mappedFields: { [key: string]: string } = {};
  selectedFields: { [key: string]: boolean } = {};
  fieldTypes: { [key: string]: string } = {};
  availableTypes: string[] = ['Text', 'Integer', 'Date', 'Boolean','Decimal'];
  dataForm: FormGroup;
  successMessage = '';
  showMapForm = false;
  showCreateForm = false;
  sheetNames: string[] = [];
  selectedSheet: string = '';

  constructor(private tableService: S_TableService, private fb: FormBuilder) {
    this.dataForm = this.fb.group({
      // Define form controls as per your data structure
      name: ['', Validators.required] // Example form control
    });
  }

  ngOnInit(): void {
    console.log('ExcelTabComponent selectedTable:', this.selectedTable);
    console.log('ExcelTabComponent fields:', this.fields);
  }

  TS_toggleShowMapForm(): void {
    this.showMapForm = !this.showMapForm;
    if (this.showMapForm) {
      this.showCreateForm = false;
    }
  }

  TS_toggleShowCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.showMapForm = false;
    }
  }

  TS_onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      this.sheetNames = wb.SheetNames; // Store sheet names
      console.log('Excel sheet names:', this.sheetNames);
      if (this.sheetNames.length > 0) {
        this.selectedSheet = this.sheetNames[0];
        this.TS_loadSheetData(this.selectedSheet); // Load data from the first sheet by default
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  TS_loadSheetData(sheetName: string): void {
    const target: DataTransfer = <DataTransfer><unknown>document.querySelector('.input-file');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const ws: XLSX.WorkSheet = wb.Sheets[sheetName];

      this.data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.headers = this.data[0] || []; // Extract headers if available
      console.log('Excel data:', this.data);
      console.log('Excel headers:', this.headers);
    };
    reader.readAsBinaryString(target.files[0]);
  }
  TS_filterSelectedFieldsData(data: any[]): any[] {
    return data.map(row => {
      const filteredRow: any = {};
      this.headers.forEach((header, index) => {
        if (this.selectedFields[header]) {
          filteredRow[header] = row[index];
        }
      });
      return filteredRow;
    });
  }
  TS_createSelectedFieldsAndAddData(): void {
    // Filter out the headers that are selected and not already existing
    const newFieldHeaders = this.headers.filter(header => this.selectedFields[header] && !this.fields.some(field => field.name === header));
  
    const createFieldObservables = newFieldHeaders.map(header => {
      const fieldData = {
        name: header,
        field_type: this.fieldTypes[header].toLocaleUpperCase(),
        table: this.selectedTable.id,
        // Add additional field properties if necessary
      };
      console.log('Field data:', fieldData);
      return this.tableService.S_createField(fieldData);
    });
      
    forkJoin(createFieldObservables).subscribe({
      next: () => {
        // After creating the new fields, retrieve existing data
        this.TS_mergeAndSendData();
      },
      error: (error) => {
        console.error('Error creating fields:', error);
        this.successMessage = 'Error creating fields!';
      },
      complete: () => {
        this.successMessage = 'Fields created successfully!';
      }
    });
  }
  TS_mergeAndSendData(): void {
    this.tableService.S_getAllData().subscribe({
      next: (existingData) => {
        console.log('Existing data 22:', existingData);
        const concernedData = existingData.filter((data) => data.table === this.selectedTable.id);
        const concernedIds=concernedData.map((data) => data.id);
        concernedIds.map(id => this.tableService.S_deleteData(id).subscribe(
          
        ));
        const mergedData = this.TS_mergeData(concernedData, this.data.slice(1));
        console.log('Merged data:', mergedData);
        this.TS_sendDataToBackend(mergedData);
        console.log('Delete observables:');

      },
      error: (error) => {
        console.error('Error retrieving existing data:', error);
        this.successMessage = 'Error retrieving existing data!';
      }
    });
  }
    
    TS_mergeData(existingData: any[], newData: any[]): any[] {
      const Data=existingData.map((row, index) => {existingData[index].details});
      console.log('Data:', Data);
      const mergedData = existingData.map((row, index) => {
        const newRow: any = { ...row.details };
        this.headers.forEach((header, idx) => {
          if (this.selectedFields[header]) {
            newRow[header] = newData[index] ? newData[index][idx] : null;
          }
        });
        return newRow;
      });

      for (let i = existingData.length; i < newData.length; i++) {
        const newRow: any = {};
        this.headers.forEach((header, idx) => {
          if (this.selectedFields[header]) {
            newRow[header] = newData[i][idx];
            console.log("new row inside the for" ,newRow)          }
        });
        mergedData.push(newRow);
      }
      return mergedData;}

  TS_sendDataToBackend(mergedData: any[]): void {
    console.log('Merged data:', mergedData);
    const dataObservables = mergedData.map(dataRow => {
      console.log('Data row:', dataRow);
      const data = {
        table: this.selectedTable.id,
        details: dataRow
      };
      return this.tableService.S_createData(data);
    });
  
    forkJoin(dataObservables).subscribe({
      next: (response) => {
        console.log('Data sent to backend successfully:', response);
        this.successMessage = 'Data added successfully!';
      },
      error: (error) => {
        console.error('Error sending data to backend:', error);
        this.successMessage = 'Error adding data!';
      }
    });
  }
  TS_mapFields(): void {
    if (Object.keys(this.mappedFields).length === 0) {
      console.error('Mapped fields are empty. Please map fields before proceeding.');
      return;
    }
    if (this.headers.length === 0 || this.data.length === 0) {
      console.error('No Excel data or headers available.');
      return;
    }
    const mappedData: any[] = [];
        for (let i = 1; i < this.data.length; i++) {
      const row = this.data[i];
      const newRow: any = {};
      Object.keys(this.mappedFields).forEach(fieldName => {
        const excelHeader = this.mappedFields[fieldName];
        const columnIndex = this.headers.indexOf(excelHeader);
        if (columnIndex !== -1 && row[columnIndex] !== undefined) {
          newRow[fieldName] = row[columnIndex];
        } else {
          console.warn(`Excel column "${excelHeader}" not found for field "${fieldName}".`);
        }
      });
      mappedData.push(newRow);
    }
    console.log('Mapped data:', mappedData);
    this.TS_sendDataToBackend(mappedData);
  }

}
