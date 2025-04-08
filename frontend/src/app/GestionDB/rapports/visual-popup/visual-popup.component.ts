import { Component, Inject, OnInit,Input ,Optional} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { S_VisualService } from '../../services/visualService/visual.service';
import { MatDialogRef } from '@angular/material/dialog';
import { S_SharedDataService } from '../../services/sharedData/shared-data.service';
import { S_TableService } from 'src/app/GestionAuth/services/TableService/Table.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-visual-popup',
  templateUrl: './visual-popup.component.html',
  styleUrls: ['./visual-popup.component.css']
})
export class VisualPopupComponent implements OnInit {
  @Input() visual: any;
  @Input() websiteId: any;

  tableHeaders: string[] = [];
  tableRows: any[] = [];
  selectedFieldsByTableId: { [tableId: string]: { id: string; name: string; data: any[] }[] } = {};
  showTables = false;
  selectedTables: { id: string; name: string; }[] = [];
  selectedFields: { id: string; name: string; data: any[] }[] = [];
  tables: any[] = [];
  selectedTable: any;
  showFields = false;
  fields: { id: string; name: string; data: any[] }[] = [];
  allFields: any[] = [];
  showAddRow = false; // Flag to control displaying the add row section
  newRow: any = {}; // Object to hold data for the new row being added
  editingRow: any = null; // Reference to the row being edited
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private V_visualService: S_VisualService,
    @Optional() private dialogRef: MatDialogRef<VisualPopupComponent>,
    private V_sharedDataService: S_SharedDataService,
    private V_tableService: S_TableService,
    private route : ActivatedRoute,
  ) {
    if (data) {
      this.visual = data.visualData;
      this.websiteId = data.websiteId;
    }
  }

  ngOnInit(): void {

console.log("visual",this.visual);
console.log("websiteId",this.websiteId)
   // Assurez-vous que visual et websiteId ne sont pas null
   if (!this.visual || !this.websiteId) {
    console.error('Visual or WebsiteId is not defined.');
    return; // Ne continuez pas si les valeurs ne sont pas définies
  }

  this.selectedFieldsByTableId = this.visual.selectedFields;
  console.log("this.selectedFieldsByTableId", this.selectedFieldsByTableId);
  this.TS_loadData();
  this.V_tableService.S_getAllFields().subscribe((fields) => {
    this.allFields = fields;
  }); 
  }

  TS_loadVisual() {
    this.V_visualService.S_getVisualById(this.visual.id).subscribe(visual => {
      this.visual = visual;
      console.log("Visual data loaded:", visual);
      this.TS_loadData(); // Load data after visual is fetched
    });
  }

  TS_selectTable(table: any) {
    this.selectedTable = table;
    this.fields = this.selectedFieldsByTableId[table.id];
    this.showFields = true;
  }

  TS_deleteField(field: any) {
    console.log("Field to delete", field);
    // Iterate over each table ID in selectedFieldsByTableId
    for (const tableId in this.selectedFieldsByTableId) {
      if (this.selectedFieldsByTableId.hasOwnProperty(tableId)) {
        // Find the index of the field to delete
        const fieldIndex = this.selectedFieldsByTableId[tableId].findIndex(f => f.id === field.id);
        // If the field is found, remove it from the array
        if (fieldIndex !== -1) {
          this.selectedFieldsByTableId[tableId].splice(fieldIndex, 1);
          // Log the updated table fields
          console.log(`Updated fields for table ${tableId}:`, this.selectedFieldsByTableId[tableId]);
        }
      }
    }
    this.TS_updateVisualData(field.name);
    // Log the updated selectedFieldsByTableId
    console.log("Updated selectedFieldsByTableId", this.selectedFieldsByTableId);
    this.visual.selectedFields = this.selectedFieldsByTableId;
  }

  TS_updateVisualData(fieldName: string) {
    // Remove the field with the specified name from visual.data
    this.visual.data = this.visual.data.map((row: { [key: string]: any }) => {
      const updatedRow: { [key: string]: any } = { ...row };
      delete updatedRow[fieldName];
      return updatedRow;
    });

    this.TS_updateVisual();

    // Log the updated visual data
    console.log("Updated visual data", this.visual.data);
    this.TS_loadData();
  }

  TS_updateVisual(){
    this.V_visualService.S_updateVisual(this.visual.id, this.visual).subscribe(() => {
      console.log("Visual data updated successfully");
    });
  }

  TS_loadData() {
    if (this.visual && this.visual.data) {
      this.tableHeaders = Object.keys(this.visual.data[0]);
      this.tableRows = this.visual.data;
      console.log("Table Headers:", this.tableHeaders);
      console.log("Table Rows:", this.tableRows);
    }
  }

  TS_closeDialog() {
    this.dialogRef.close();
  }

  TS_objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  TS_handleEdit() {
    console.log("this visual", this.visual);
    this.showTables = true;
    const selectedTablesId = this.TS_objectKeys(this.visual.selectedFields);
    console.log("IDS", this.selectedFieldsByTableId);
    this.V_tableService.S_getAllTables().subscribe((tables) => {
      this.tables = tables;
      const selectedTablesIds = Object.keys(this.selectedFieldsByTableId).map(id => parseInt(id, 10));
      this.selectedTables = this.tables.filter((table) => selectedTablesIds.includes(table.id));
      this.selectedTables.forEach((table, index) => {
        this.selectedTables[index].name = table.name.replace(`_${this.websiteId}`, '');
      });
      console.log(this.selectedTables);
    });

    this.V_tableService.S_getAllFields().subscribe((fields) => {
      this.selectedFields = fields.filter(field => {
        return Object.keys(this.selectedFieldsByTableId).some(tableId => {
          return this.selectedFieldsByTableId[tableId].some(selectedField => selectedField.id === field.id);
        });
      });
      console.log("Filtered fields", this.selectedFields);
    });
  }

  TS_addRow() {
    this.showAddRow = true;
    // Initialize newRow object with empty values for each table header
    this.tableHeaders.forEach(header => {
      this.newRow[header] = '';
    });
  }

  TS_saveRow() {
    // Check if we are editing an existing row
    const existingRowIndex = this.tableRows.findIndex(row => row === this.editingRow);
    if (existingRowIndex !== -1) {
      // Update the existing row
      this.tableRows[existingRowIndex] = { ...this.newRow };
    } else {
      // Add the new row to tableRows array
      this.tableRows.push({ ...this.newRow });
    }
    // Reset newRow object and hide the add row section
    this.newRow = {};
    this.editingRow = null; // Clear editing row
    this.showAddRow = false;
    this.visual.data = this.tableRows;
    this.TS_updateVisual();
  }

  TS_cancelAddRow() {
    // Reset newRow object and hide the add row section
    this.newRow = {};
    this.editingRow = null; // Clear editing row
    this.showAddRow = false;
  }

  TS_deleteRow(row: any) {
    console.log("Row to delete", row);
    // Find the index of the row to delete
    const rowIndex = this.tableRows.findIndex(r => r === row);
    // If the row is found, remove it from the array
    if (rowIndex !== -1) {
      this.tableRows.splice(rowIndex, 1);
      // Log the updated table rows
      console.log("Updated table rows:", this.tableRows);
    }
    this.TS_updateVisual();
  }

  TS_editRow(row: any) {
    console.log("Row to edit", row);
    // Set the values of the row to be edited in the newRow object
    this.newRow = { ...row };
    this.editingRow = row; // Store the reference to the row being edited
    // Show the add row section
    this.showAddRow = true;
    this.TS_updateVisual();
  }
  TS_toggleEdit(){
    if(this.showAddRow==true)
      this.showAddRow=false;
  }
}
