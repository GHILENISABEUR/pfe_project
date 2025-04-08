import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { S_TableService } from '../../services/TableService/Table.service';
import { concatMap, from, map, Observable, Subscription } from 'rxjs';
//Niv 5 data form 
@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent implements OnInit {
  @Input() selectedTable: any;
  @Input() fields!: any[];
  currentPageIndex: number = 0;
  dataForm!: FormGroup ;
  dataSets:any[] = [];
  tables: any[] = [];
  formData: any = {};
  selectedTableId: number | null = null;
  currentPage: number = 1;
  pageSize: number = 1;
  totalPages: number = 1;/*
    Install Angular Cli
    npm install -g @angular/cli

    Usage
    ng help

    Generate and serve an Angular project via a development server
    ng new PROJECT-NAME
    cd PROJECT-NAME
    ng serve

    Generate Component
    You can use the ng generate (or just ng g)
    Examples
      Component: ng g component my-new-component
      Directive: ng g directive my-new-directive
      Pipe:      ng g pipe my-new-pipe
      Service:   ng g service my-new-service
      Class:     ng g class my-new-class
      Guard:     ng g guard my-new-guard
      Interface: ng g interface my-new-interface
      Enum:      ng g enum my-new-enum
      Module:    ng g module my-module

    Bundling
    All builds make use of bundling, and using the --prod flag in ng build --prod or ng serve --prod will also make use of uglifying and tree-shaking functionality.
    ng build --prod
    ng serve --prod

    Run unit tests
    ng test

    Run tests with coverage. The report will be in the coverage/ directory
    ng test --code-coverage

    Tests will execute after a build is executed via Karma, and it will automatically watch your files for changes.
    You can run tests a single time via --watch=false or --single-run.

    Run end-to-end tests
    ng e2e

    Before running the tests make sure you are serving the app via ng serve. End-to-end tests are run via Protractor.

    Lint you app code using tslint
    ng lint

    Open the official Angular API documentation for a given keyword on angular.io.
    ng doc [search term]

    For more info: https://cli.angular.io

   */
  currentEditId: number | null = null;
  showAddForm: boolean = false;
  private dataSubscription: Subscription | undefined;
  fieldRef:any;
  data:any[]=[];
  ForeignKeyData:{ [key: number]: any[] } = {};
  RelatedFields:any[]=[];
  RelatedFieldsData:{ [key: string]: any[] } = {};
  foreignKeyValues:{ [key: string]: number } = {};
field: any;
dataSet: any;
  constructor(private formBuilder: FormBuilder, private V_tableService: S_TableService) {

  }
  ngOnInit(): void {
    this.V_tableService.S_getAllTables().subscribe(tables => {
          this.tables = tables;
        });
        this.V_tableService.selectedTableId$.subscribe(tableId => {
          this.selectedTableId = tableId;
          if (tableId) {
            // If a table is selected, fetch its fields
            this.V_tableService.S_getFieldsByTable(tableId).subscribe(fields => {
              this.fields = fields;
              this.TS_createForm();
            });
          }
        });
        if (this.selectedTable) {
          this.TS_loadData(this.selectedTable.id);
        }
        const ForeignKeys=this.fields.filter((field:any)=>field.is_foreign_key);
        this.RelatedFields=ForeignKeys.map((field:any)=>field.relatedField);
        console.log("related Fields" ,this.RelatedFields)

        this.processForeignKeys(ForeignKeys);

      }

      TS_loadData(tableId: number): void {
        if (tableId) {
          this.V_tableService.S_getFieldsByTable(tableId).subscribe(fields => {
            this.fields = fields;
            this.TS_createForm();
          });
          this.V_tableService.S_getDataByTable(tableId).subscribe(data => {
            this.dataSets = data;
            this.totalPages = Math.ceil(data.length / this.pageSize);
            this.currentPage = 1; // Reset to the first page
          });
        }
      }

      TS_nextPage(): void {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        }
      }

      TS_previousPage(): void {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      }

      // Helper method to get the current slice of data for the page
      TS_currentDataSets(): any[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.dataSets.slice(startIndex, startIndex + this.pageSize);
      }


      TS_createForm(): void {
        const formGroupConfig: any = {};
        this.fields.forEach(field => {
          let defaultValue: any = '';
          let validators = [Validators.required];  // Default to required

          switch (field.field_type) {
            case 'LIST':
              defaultValue = field.list_values.length > 0 ? field.list_values[0] : '';
              break;
            case 'INTEGER':
              validators.push(Validators.pattern(/^\d+$/)); // Only integer values allowed
              defaultValue = '';
              break;
            case 'DECIMAL':
              validators.push(Validators.pattern(/^\d+(\.\d+)?$/)); // Only decimal values allowed
              defaultValue = '';
              break;
            case 'DATE':
              defaultValue = '';
              break;
            case 'BOOLEAN':
              validators = [Validators.requiredTrue];  // Ensure the checkbox is checked
              defaultValue = false;
              break;
            default:
              defaultValue = '';
              break;
          }

          formGroupConfig[field.name] = [defaultValue, validators];
        });

        this.dataForm = this.formBuilder.group(formGroupConfig);
      }


      TS_buildForm(): void {
        const group: any = {};
        this.fields.forEach(field => {
          const fieldValue = this.dataSets[this.currentPageIndex]?.[field.name] || '';
          switch (field.field_type) {
            case 'LIST':
              group[field.name] = [fieldValue || field.list_values[0], Validators.required];
              break;
            case 'IMAGE':
              group[field.name] = [fieldValue, Validators.required];  // Use existing URL or empty
              break;
            default:
              group[field.name] = [fieldValue, Validators.required];
          }
        });
        this.dataForm = this.formBuilder.group(group);
      }


      TS_onSubmit(): void {
        // Ensure a table is selected
        if (!this.selectedTable || !this.dataForm.valid) {
          console.log("No table selected or form is invalid");
          return;
        }

        // Prepare data object to send to server
        const data = {
          table: this.selectedTable.id, // Use selectedTable's id
          details: this.dataForm.value // Use form value to get input data
        };

        // Call the TableService to create data
        console.log("data created",data)
        this.V_tableService.S_createData(data).subscribe(result => {
          console.log("Data created successfully:", result);

          // Add the newly created data to the dataSets array
          this.dataSets.push(result);

          // Recalculate totalPages
          this.totalPages = Math.ceil(this.dataSets.length / this.pageSize);

          // Optionally, adjust the currentPage to the last page if the new data won't be visible on the current page
          if (this.currentPage < this.totalPages) {
            this.currentPage = this.totalPages;
          }

          this.dataForm.reset();
        }, error => {
          console.error("Error creating data:", error);
        });
      }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields']) {
      this.TS_buildForm();
    }
    if (changes['selectedTable'] && this.selectedTable) {
      this.TS_loadData(this.selectedTable.id);
    }
  }

  getPlaceholder(field: any): string {
    switch (field.field_type) {
      case 'DATE':
        return 'yy/aa/mm'; // Placeholder for date type fields
      case 'TEXT':
        return 'Enter text'; // Placeholder for text fields
      case 'INTEGER':
        return 'Enter integer'; // Placeholder for integer fields
      case 'BOOLEAN':
        return 'Select yes or no'; // Placeholder for boolean (checkbox) fields
      case 'LIST':
        return 'Select option'; // Placeholder for list-type fields
      case 'DECIMAL':
        return 'Enter decimal value'; // Placeholder for decimal fields
      default:
        return 'Enter value'; // Default placeholder
    }
  }

  TS_getDisplayedFields() {
    return this.fields;
  }

  TS_deleteRow(dataId: number): void {
    // Call the service to delete the data
    this.V_tableService.S_deleteData(dataId).subscribe({
      next: (response) => {
        console.log("Data deleted successfully", response);
        // Remove the deleted row from the dataSets array
        this.dataSets = this.dataSets.filter(dataSet => dataSet.id !== dataId);
        // Recalculate totalPages in case the number of pages changes
        this.totalPages = Math.ceil(this.dataSets.length / this.pageSize);
      },
      error: (error) => console.error("Error deleting data:", error)
    });
  }

  TS_editRow(dataItem: any): void {
    this.currentEditId = dataItem.id; // Set the current editing ID
    this.TS_updateFormData(dataItem); // Populate the form with dataItem's values
  }

  TS_updateFormData(dataItem: any): void {
    this.dataForm.patchValue(dataItem.details); // Assuming 'details' contains the fields' data
  }

  TS_onSubmitEdit(): void {
    if (!this.currentEditId || !this.dataForm.valid) {
        console.log("No item selected for editing or form is invalid");
        return;
    }

    const updatedData = {
        id: this.currentEditId,
        details: this.dataForm.value
    };

    this.V_tableService.S_updateData(this.currentEditId, updatedData).subscribe(result => {
        console.log("Data updated successfully:", result);
        const index = this.dataSets.findIndex(item => item.id === this.currentEditId);
        if (index !== -1) {
            this.dataSets[index].details = result.details;
        }
        this.currentEditId = null;
        this.dataForm.reset();
    }, error => {
        console.error("Error updating data:", error);
    });
}

TS_onSubmitAdd(): void {
  if (!this.dataForm.valid) {
    console.log("Form is invalid");
    return;
  }

  const data = {
    table: this.selectedTable.id,
    details: this.dataForm.value
  };
  console.log("data",data);

  this.V_tableService.S_createData(data).subscribe(result => {
    console.log("Data created successfully:", result);

    this.dataSets.push(result);
    this.totalPages = Math.ceil(this.dataSets.length / this.pageSize);

    if (this.currentPage < this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.dataForm.reset();
    this.showAddForm = false; // Hide the form after submission
  }, error => {
    console.error("Error creating data:", error);
  });
}
TS_toggleAddForm(): void {
  this.showAddForm = !this.showAddForm;
  if (this.showAddForm) {
    this.TS_createForm(); // Ensure the form is created when the form is shown
  }
}

processForeignKeys(ForeignKeys: any[]): void {
  from(ForeignKeys).pipe(
    concatMap((field: any) => this.TS_getForeignKeyOptions(field))
  ).subscribe({
    next: (result) => {
      console.log("Processed foreign key options:", result);
    },
    error: (err) => {
      console.error("Error processing foreign key options:", err);
    },
    complete: () => {
      console.log("All foreign key options processed.");
    }
  });
}

TS_getForeignKeyOptions(field: any): Observable<any> {
  console.log("field inside get foreign key ", field);

  return this.V_tableService.S_getAllFields().pipe(
    map(fields => {
      this.fieldRef = fields.find((f: any) => f.id === field.referedFieldId);
      console.log("Field reference:", this.fieldRef);

      if (!this.fieldRef) {
        console.error("Field reference not found for referedFieldId:", field.referedFieldId);
        throw new Error(`Field reference not found for referedFieldId: ${field.referedFieldId}`);
      }

      return this.fieldRef;
    }),
    concatMap((fieldRef) => this.V_tableService.S_getAllTables().pipe(
      map(tables => {
        this.tables = tables;
        console.log("fieldRef.table",fieldRef.table)
        const referredTableName = this.tables.find((table: any) => table.id === fieldRef.table)?.name;
        console.log("Referred table name:", referredTableName);

        if (!referredTableName) {
          throw new Error(`Table name not found for table id: ${fieldRef.table}`);
        }

        return referredTableName;
      }),

      concatMap((referredTableName) => this.V_tableService.S_getTableDataByName(referredTableName).pipe(
        map(data => {
          console.log("Data for foreign key:", data);
          const fieldRefName = this.fieldRef.name.toLowerCase();
          console.log("Field reference name:", fieldRefName);

          // Map data based on dynamic field name this.fieldRef.name
          this.RelatedFieldsData[field.relatedField] = data.map((item: any) => ({
            id: item.id,
            details: item[fieldRefName] // Use this.fieldRef.name to access the correct field
          }));
          console.log("RelatedFieldsData updated:", this.RelatedFieldsData);

          return this.RelatedFieldsData;
        })
      ))
    ))
  );
}
TS_onSelect(selectedOption: any, field: any) {
  const relatedForeignKey = this.fields.find((f: any) => f.relatedField === field.name);
  const optionID = this.RelatedFieldsData[field.name].find((item: any) => item.details === selectedOption.value)?.id;
  if (relatedForeignKey) {
    this.foreignKeyValues[relatedForeignKey.name] = Number(optionID);

  }
}

}


