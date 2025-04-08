import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { S_TableService } from '../../services/TableService/Table.service';
import { integerValidator, decimalValidator, dateValidator } from '../../DB/validators/typesValidator';
import { Observable, Subscription, concatMap, forkJoin, from, map } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
//Niv 4 data tab
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() selectedTable: any;
  @Input() fields!: any[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  currentPageIndex: number = 0;
  dataForm!: FormGroup;
  dataSets: any[] = [];
  tables: any[] = [];
  formData: any = {};
  selectedTableId: number | null = null;
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  currentEditId: number | null = null;
  showCreateForm: boolean = true;
  private dataSubscription: Subscription | undefined;
  fieldRef: any;
  data: any[] = [];
  ForeignKeyData: { [key: number]: any[] } = {};
  RelatedFields: any[] = [];
  RelatedFieldsData: { [key: string]: any[] } = {};
  foreignKeyValues: { [key: string]: number } = {};
  dataSource = new MatTableDataSource<any>([]);
  selectedIds: number[] = [];
  displayedColumns!: string[];
  showInputFields: boolean = true;

  constructor(private formBuilder: FormBuilder, private V_tableService: S_TableService) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.V_tableService.S_getAllTables().subscribe(tables => {
      this.tables = tables;
    });
    this.V_tableService.selectedTableId$.subscribe(tableId => {
      this.selectedTableId = tableId;
      if (tableId) {
        this.V_tableService.S_getFieldsByTable(tableId).subscribe(fields => {
          this.fields = fields;
          this.TS_createForm();
        });
      }
    });
    if (this.selectedTable) {
      this.TS_loadData(this.selectedTable.id);
    }
    const ForeignKeys = this.fields?.filter((field: any) => field.is_foreign_key) || [];
    this.RelatedFields = ForeignKeys.map((field: any) => field.relatedField);
    this.processForeignKeys(ForeignKeys);
    this.displayedColumns = ['select', ...this.fields.map(field => field.name), 'actions'];
  }

  TS_loadData(tableId: number): void {
    if (tableId) {
      this.V_tableService.S_getFieldsByTable(tableId).subscribe(fields => {
        this.fields = fields;
        this.TS_createForm();
      });
      this.V_tableService.S_getDataByTable(tableId).subscribe(data => {
        this.dataSets = data;
        this.dataSource.data = data;
        this.totalPages = Math.ceil(data.length / this.pageSize);
        this.currentPage = 1;
      });
    }
  }

  TS_addNewRow(): void {
    if (!this.selectedTable || this.dataSets.some(item => item.id === -1)) return;

    const newRow = {
      id: -1,
      details: this.TS_getDefaultFormValues()
    };

    this.dataSets.unshift(newRow);
    this.dataSource.data = this.dataSets;
    this.currentEditId = newRow.id;
    this.dataForm.patchValue(newRow.details);
  }

  private TS_getDefaultFormValues(): any {
    const defaults: any = {};
    
    this.fields.forEach(field => {
      switch (field.field_type) {
        case 'LIST':
          defaults[field.name] = field.list_values?.length ? field.list_values[0] : '';
          break;
        case 'IMAGE':
          defaults[field.name] = ''; // You can specify a default placeholder image if needed
          break;
        case 'FK': 
          defaults[field.name] = null; // Assuming foreign keys store an ID or object reference
          break;
        default:
          defaults[field.name] = '';
      }
    });
  
    return defaults;
  }
  

  TS_cancelEdit(id: number): void {
    if (id === -1) {
      this.dataSets = this.dataSets.filter(item => item.id !== -1);
      this.dataSource.data = this.dataSets;
    }
    this.currentEditId = null;
    this.dataForm.reset();
  }
  TS_onSubmitEdit(): void {
    if (!this.currentEditId || !this.dataForm.valid) return;
  
    const formValue = this.dataForm.value;
  
    // Transform date fields to the required format
    this.fields.forEach(field => {
      if (field.field_type === 'DATE' && formValue[field.name]) {
        formValue[field.name] = this.formatDate(formValue[field.name]);
      }
    });
  
    if (this.currentEditId === -1) {
      const newData = {
        table: this.selectedTable.id,
        details: formValue // Use the transformed form value
      };
  
      this.V_tableService.S_createData(newData).subscribe({
        next: (result) => {
          this.dataSets = this.dataSets.filter(item => item.id !== -1);
          this.dataSets.push(result);
          this.dataSource.data = this.dataSets;
          this.currentEditId = null;
          this.dataForm.reset();
        },
        error: (error) => console.error('Error creating data:', error)
      });
    } else {
      const updatedData = {
        id: this.currentEditId,
        details: formValue // Use the transformed form value
      };
  
      this.V_tableService.S_updateData(this.currentEditId, updatedData)
        .subscribe({
          next: (result) => {
            const index = this.dataSets.findIndex(item => item.id === this.currentEditId);
            if (index !== -1) this.dataSets[index].details = result.details;
            this.currentEditId = null;
            this.dataForm.reset();
          },
          error: (error) => console.error('Error updating data:', error)
        });
    }
  }
  
  // Helper function to format the date
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Converts to YYYY-MM-DD format
  }
  // Existing methods below (maintained with original functionality)
  TS_createForm(): void {
    const formGroupConfig: any = {};
    this.fields.forEach(field => {
      let defaultValue = '';
      let validators: ValidatorFn[] = [];

      switch (field.field_type) {
        case 'LIST':
          defaultValue = field.list_values.length > 0 ? field.list_values[0] : '';
          break;
        case 'INTEGER':
          validators.push(integerValidator());
          break;
          case 'DATE':
            defaultValue = '';
            break;
        case 'DECIMAL':
          validators.push(decimalValidator());
          break;
        case 'IMAGE':
          defaultValue = '';
          break;
        default:
          defaultValue = '';
      }
      formGroupConfig[field.name] = [defaultValue, validators];
      if (field.is_foreign_key) {
        this.foreignKeyValues[field.name] = Number(defaultValue);
      }
    });
    this.dataForm = this.formBuilder.group(formGroupConfig);
  }

  TS_toggleSelection(id: number): void {
    const index = this.selectedIds.indexOf(id);
    if (index === -1) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  TS_isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  TS_isAllSelected(): boolean {
    return this.dataSource.data.every(item => this.selectedIds.includes(item.id));
  }

  TS_masterToggle(): void {
    if (this.TS_isAllSelected()) {
      this.selectedIds = [];
    } else {
      this.selectedIds = this.dataSource.data.map(item => item.id);
    }
  }

  TS_deleteMultipleRows(): void {
    if (this.selectedIds.length === 0 || !confirm('Are you sure you want to delete selected items?')) return;

    const deleteRequests = this.selectedIds.map(id => 
      this.V_tableService.S_deleteData(id)
    );

    forkJoin(deleteRequests).subscribe({
      next: () => {
        this.dataSets = this.dataSets.filter(item => !this.selectedIds.includes(item.id));
        this.dataSource.data = this.dataSets;
        this.selectedIds = [];
        this.totalPages = Math.ceil(this.dataSets.length / this.pageSize);
      },
      error: (err) => console.error('Error deleting multiple items:', err)
    });
  }
  getPlaceholder(field: any): string {
    switch (field.field_type) {
      case 'INTEGER': return `Enter a number for ${field.name}`;
      case 'DATE': return `Enter date (MM-DD-YYYY) for ${field.name}`; // Updated line
      case 'DECIMAL': return `Enter a decimal for ${field.name}`;
      case 'IMAGE': return `Enter an image URL for ${field.name}`;
      default: return `Enter ${field.name}`;
    }
  }

  toggleInputFields(): void {
    this.showInputFields = !this.showInputFields;
  }

  TS_deleteRow(dataId: number): void {
    this.V_tableService.S_deleteData(dataId).subscribe({
      next: () => {
        this.dataSets = this.dataSets.filter(dataSet => dataSet.id !== dataId);
        this.dataSource.data = this.dataSets;
        this.totalPages = Math.ceil(this.dataSets.length / this.pageSize);
      },
      error: (error) => console.error("Error deleting data:", error)
    });
  }

  TS_editRow(dataItem: any): void {
    this.currentEditId = dataItem.id;
    this.dataForm.patchValue(dataItem.details);
  }

  processForeignKeys(ForeignKeys: any[]): void {
    from(ForeignKeys).pipe(
      concatMap((field: any) => this.TS_getForeignKeyOptions(field))
    ).subscribe({
      next: (result) => console.log("Processed foreign key options:", result),
      error: (err) => console.error("Error processing foreign key options:", err),
      complete: () => console.log("All foreign key options processed.")
    });
  }

  TS_getForeignKeyOptions(field: any): Observable<any> {
    return this.V_tableService.S_getAllFields().pipe(
      map(fields => {
        this.fieldRef = fields.find((f: any) => f.id === field.referedFieldId);
        if (!this.fieldRef) throw new Error(`Field reference not found for: ${field.referedFieldId}`);
        return this.fieldRef;
      }),
      concatMap((fieldRef) => this.V_tableService.S_getAllTables().pipe(
        map(tables => {
          const referredTableName = tables.find((table: any) => table.id === fieldRef.table)?.name;
          if (!referredTableName) throw new Error(`Table not found for: ${fieldRef.table}`);
          return referredTableName;
        }),
        concatMap((referredTableName) => this.V_tableService.S_getTableDataByName(referredTableName).pipe(
          map(data => {
            this.RelatedFieldsData[field.relatedField] = data.map((item: any) => ({
              id: item.id,
              details: item[this.fieldRef.name.toLowerCase()]
            }));
            return this.RelatedFieldsData;
          })
        ))
      ))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] && !changes['fields'].firstChange) {
      this.TS_createForm();
    }
    if (changes['selectedTable'] && !changes['selectedTable'].firstChange && this.selectedTable) {
      this.TS_loadData(this.selectedTable.id);
    }
  }

  TS_onSelect(selectedOption: any, field: any) {
    const relatedForeignKey = this.fields.find((f: any) => f.relatedField === field.name);
    const optionID = this.RelatedFieldsData[field.name].find((item: any) => item.details === selectedOption.value)?.id;
    if (relatedForeignKey) {
      this.foreignKeyValues[relatedForeignKey.name] = Number(optionID);
    }
  }
}