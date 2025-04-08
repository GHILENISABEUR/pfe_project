import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { S_TableService } from '../../services/TableService/Table.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { S_CategoryService } from '../../services/categService/Category.service';
import { TableNameValidator } from '../validators/tableValidator';
import { ConnectionDBComponent } from '../connection-db/connection-db.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
//Niv 2 TS
@Component({
  selector: 'app-all-tables',
  templateUrl: './all-tables.component.html',
  styleUrls: ['./all-tables.component.css']
})
export class AllTablesComponent implements OnInit {
  @Input() selectedCategory: any;
  offsetX: number = 0;
  offsetY: number = 0;
  tables: any[] = [];
  showS6o4o6Tab: boolean = false;
  selectedTable: any = null;
  fields: any[] = [];
  tableForm: FormGroup;
  isEditing: boolean = false;
  editingTableId: number | null = null;
  editingTableName: string | null = null;
  errorMessage: string | null = null;
  categories: any[] = [];
  showManagementButtons: boolean = false;
  showCreateForm = false;
  showCategorySelect = false;
  selectedRestoreCategory: any = null; // Track selected category for restoration
  selectedTableId: number | null = null;
  tablefields: any[] = [];
  tableData: any[] = [];
  websiteId?: number;
  nonClassifiedCategory: any;

  constructor(
    private V_tableService: S_TableService,
    private route: ActivatedRoute,
    private V_categoryService: S_CategoryService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {
    this.tableForm = this.formBuilder.group({
      name: ['', Validators.required],
      category: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ", this.websiteId);
    });
    this.TS_LoadCategories();

    if (this.selectedCategory) {
      this.TS_LoadTablesByCategory(this.selectedCategory.id);
      this.tableForm.controls['category'].setValue(this.selectedCategory.id);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] && changes['selectedCategory'].currentValue) {
      this.TS_LoadTablesByCategory(this.selectedCategory.id);
    }
  }

  TS_LoadCategories(): void {
    this.V_categoryService.getCategoriesByWebsiteId(this.websiteId!).subscribe(categories => {
      this.categories = categories;
      this.nonClassifiedCategory = categories.find(cat => cat.name === 'Non Classified');
    });
  }

  TS_LoadTablesByCategory(categoryId: number): void {
    this.V_tableService.S_getTablesByCategoryId(categoryId).subscribe(tables => {
      this.tables = tables.map(table => {
        return {
          ...table,
          name: table.name.replace(`_${this.websiteId}`, '') // Remove website ID
        };
      });
      console.log("this.tables", this.tables);
      this.tableForm.get('name')?.setValidators([Validators.required, TableNameValidator(this.tables, null)]);
      this.tableForm.get('name')?.updateValueAndValidity();
    });
  }

  TS_DragStart(event: DragEvent): void {
    const target = event.target as HTMLElement | null;
    if (target) {
      const rect = target.getBoundingClientRect();
      this.offsetX = event.clientX - rect.left;
      this.offsetY = event.clientY - rect.top;
    }
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  }

  TS_DragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement | null;
    if (target) {
      const x = event.clientX - this.offsetX;
      const y = event.clientY - this.offsetY;
      target.style.position = 'absolute';
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
    }
  }

  TS_SelectTable(table: any): void {
    console.log("TS_SelectTable", table);
    this.selectedTable = table;
    this.V_tableService.S_getFieldsByTable(table.id).subscribe(fields => {
      this.fields = fields;
    });
    this.TS_ToggleS6o4o6Tab();
  }

  TS_EditTable(tableId: number, tableName: string): void {
    this.isEditing = true;
    this.editingTableId = tableId;
    this.editingTableName = tableName;
    this.tableForm.setValue({ name: tableName, category: this.selectedCategory.id });
    this.showCreateForm = true;  // Show the form for editing
    // Update the validator for the 'name' field
    this.tableForm.get('name')?.setValidators([Validators.required, TableNameValidator(this.tables, this.editingTableName)]);
    this.tableForm.get('name')?.updateValueAndValidity();
  }

  TS_DeleteTable(event: MouseEvent, tableId: number): void {
    event.stopPropagation(); // Prevent the click event from bubbling up

    const confirmDeletion = window.confirm('Are you sure you want to delete this table? This action cannot be undone.');

    if (confirmDeletion) {
      this.V_tableService.S_deleteTable(tableId).subscribe(() => {
        // Reload tables after deletion
        this.TS_LoadTablesByCategory(this.selectedCategory.id);
        this.TS_ResetForm(); // Reset any form state if needed
      });
    }
  }

  TS_HandleCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      this.selectedRestoreCategory = target.value;
    }
  }

  TS_RestoreTable(): void {
    if (this.selectedTable && this.selectedRestoreCategory) {
      const tableId = this.selectedTable.id;
      const categoryId = this.selectedRestoreCategory;

      this.V_tableService.S_updateTableCategory(tableId, categoryId).subscribe({
        next: () => {
          this.TS_LoadTablesByCategory(this.selectedCategory.id);
          this.selectedTable = null;
          this.showCategorySelect = false;
        },
        error: (error) => {
          console.error('Error restoring table:', error);
        }
      });
    }
    this.showCategorySelect = false;
  }

  TS_ToggleManagementButtons(): void {
    this.showManagementButtons = !this.showManagementButtons;
    if (!this.showManagementButtons) {
      this.isEditing = false;
      this.showCreateForm = false;
    }
  }

  TS_CreateTable(): void {
    if (this.tableForm.valid) {
      // Add website ID to the table name
      const tableNameWithWebsiteId = `${this.tableForm.value.name}_${this.websiteId}`;

      const tableData = { ...this.tableForm.value, name: tableNameWithWebsiteId, category: this.selectedCategory.id };

      this.V_tableService.S_createTable(tableData).subscribe({
        next: () => {
          this.TS_LoadTablesByCategory(this.selectedCategory.id);
          this.tableForm.reset({ name: '', category: this.selectedCategory.id });
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        }
      });
    } else {
      console.log("Form is not valid, cannot create table.");
    }
  }

  TS_UpdateTable(): void {
    if (this.tableForm.valid && this.editingTableId !== null) {
      const tableNameWithWebsiteId = `${this.tableForm.value.name}_${this.websiteId}`;

      const tableData = { ...this.tableForm.value, name: tableNameWithWebsiteId, category: this.selectedCategory.id };

      this.V_tableService.S_updateTable(this.editingTableId, tableData).subscribe({
        next: () => {
          this.TS_LoadTablesByCategory(this.selectedCategory.id);
          this.TS_ResetForm();
          this.showCreateForm = false;
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        }
      });
    }
  }

  TS_SubmitForm(): void {
    if (this.isEditing) {
      this.TS_UpdateTable();  // Call update if editingTableId is set
    } else {
      this.TS_CreateTable();  // Call create if no editingTableId is set
    }
  }

  TS_CancelEdit(): void {
    this.isEditing = false;
    this.showCreateForm = false;
    this.tableForm.reset();
  }

  TS_ResetForm(): void {
    this.tableForm.reset({
      name: '',          // Reset the 'name' control to empty
      category: this.selectedCategory ? this.selectedCategory.id : null  // Reset 'category' to current or null
    });
    this.isEditing = false;
    this.editingTableId = null;
    this.errorMessage = null;  // Clear any existing error messages
  }

  TS_ImportFromDB(): void {
    const dialogRef = this.dialog.open(ConnectionDBComponent, {
      width: '600px',
      height: '500px',
      data: {}
    });

    dialogRef.componentInstance.values.subscribe((data: any) => {
      console.log('Data received from dialog:', data);
      this.tablefields = data.fields;
      this.tableData = data.data;

      this.tablefields.forEach((field) => {
        field.field_type = this.TS_mapPostgresTypeToAllowedType(field.field_type);
      });

      console.log('table data', this.tableData);
      console.log('table fields', this.tablefields);
    });

    dialogRef.componentInstance.tableName.subscribe((table: string) => {
      console.log('Table name received from dialog:', table);

      // Add website ID to the table name
      const tableNameWithWebsiteId = `${table}_${this.websiteId}`;

      const tableData = {
        name: tableNameWithWebsiteId,
        category: this.selectedCategory.id
      };

      this.V_tableService.S_createTable(tableData).subscribe({
        next: () => {
          console.log('Table created successfully');
          this.V_tableService.S_getTablesByCategoryId(this.selectedCategory.id).subscribe(tables => {
            this.tables = tables;
            console.log('Tables1:', this.tables);

            const tableId = this.tables.find((t) => t.name === tableNameWithWebsiteId)?.id;
            console.log('Table ID1:', tableId);

            this.tablefields.forEach((field) => {
              const fieldData = field;
              fieldData.table_id = tableId;
              fieldData.table = tableId;
              console.log('Field data:', fieldData);

              this.V_tableService.S_createField(fieldData).subscribe({});

              this.tableData.forEach((data) => {
                const dataToInsert = {
                  table: tableId,
                  details: data
                };

                console.log('Data to insert:', dataToInsert);
                this.V_tableService.S_createData(dataToInsert).subscribe({
                  next: () => {
                    console.log('Data inserted successfully');
                  },
                  error: (error) => {
                    console.error('Error inserting data:', error);
                  }
                });
              });
            });
            this.tables = tables.map(table => {
              return {
                ...table,
                name: table.name.replace(`_${this.websiteId}`, '') // Remove website ID
              };
            });
          });
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        }
      });
    });
  }

  TS_closeS6o4o6Tab(): void {
    this.showS6o4o6Tab = false;
  }

  TS_ToggleS6o4o6Tab(): void {
    if (this.selectedTable) {
      this.showS6o4o6Tab = !this.showS6o4o6Tab;
    }
  }

  TS_LoadTables(): void {
    this.V_tableService.S_getAllTables().subscribe(data => {
      this.tables = data;
    });
  }

  TS_mapPostgresTypeToAllowedType(postgresType: string): string {
    switch (postgresType) {
      case 'character varying':
      case 'varchar':
      case 'character':
      case 'char':
      case 'text':
        return 'TEXT';
      case 'integer':
      case 'int':
      case 'smallint':
      case 'bigint':
        return 'INTEGER';
      case 'date':
        return 'DATE';
      case 'boolean':
        return 'BOOLEAN';
      case 'numeric':
      case 'decimal':
      case 'real':
      case 'double precision':
        return 'DECIMAL';
      default:
        return 'UNKNOWN';  // Handle unknown types as needed
    }
  }
}