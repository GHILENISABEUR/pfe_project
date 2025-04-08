import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { S_TableService } from '../../services/TableService/Table.service';
import { MatDialog } from '@angular/material/dialog';
import { ListComponent } from '../listType/list/list.component';
import { FieldNameValidator } from '../validators/fieldValidator';
import { ForeignKeyComponent } from '../foreign-key/foreign-key.component';
import { ActivatedRoute } from '@angular/router';
//NIV 3 TS
@Component({
  selector: 'app-conception-table',
  templateUrl: './conception-table.component.html',
  styleUrls: ['./conception-table.component.css']
})
export class ConceptionTableComponent implements OnInit, OnChanges {
  @Input() selectedTable: any;
  @Output() closeTab = new EventEmitter<void>();

  showMoreDetails = false;
  showS6o4o7DataTab: boolean = false;
  offsetX: number = 0;
  offsetY: number = 0;
  fieldForm!: FormGroup;
  fields: any[] = [];
  isFieldEditing: boolean = false;
  editingFieldId: number | null = null;
  selectedTableId!: number;
  tables: any[] = [];
  showS6o4o8DataForm: boolean = false;
  activeComponent: string = '';
  showFieldForm: boolean = false;
  showConceptionTools: boolean = false;
  isConceptionToolsActive: boolean = false;
  isDataTabActive: boolean = false;
  isDataFormActive: boolean = false;
  selectedField: any = null;
  referedFieldId: number | null = null;
  originalFieldName: string | null = null;
  isExcelActive: boolean = false;
  referredFieldName: String = '';
  referredTable: String = '';
  FieldId: number = 0;

  fieldTypes = [
    { value: 'TEXT', display: 'Text' },
    { value: 'INTEGER', display: 'Integer' },
    { value: 'DATE', display: 'Date' },
    { value: 'BOOLEAN', display: 'Boolean' },
    { value: 'LIST', display: 'List' },
    { value: 'DECIMAL', display: 'Decimal' },
  ];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private V_tableService: S_TableService,
    public dialog: MatDialog
  ) {}

  websiteId: any;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ", this.websiteId);
    });
    this.TS_initForm();
    if (this.selectedTable) {
      this.TS_loadFields(this.selectedTable.id);
    }
    this.TS_subscribeToFieldTypeChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedTable'] && this.selectedTable) {
      this.TS_loadFields(this.selectedTable.id);
    }
  }

  TS_subscribeToFieldTypeChanges() {
    this.fieldForm.get('field_type')?.valueChanges.subscribe((type) => {
      if (type === 'LIST') {
        const existingListValues = this.isFieldEditing ? this.fieldForm.value.list_values : [];
        this.TS_openListPopUp(existingListValues);
      }
    });
  }

  TS_openListPopUp(initialList: any[] = []): void {
    const dialogRef = this.dialog.open(ListComponent, {
      width: '400px',
      height: '350px',
      data: { listValues: initialList }
    });

    dialogRef.componentInstance.listValuesUpdated.subscribe((updatedListValues: string[]) => {
      const listValuesControl = this.fieldForm.get('list_values') as FormArray;
      listValuesControl.clear();
      updatedListValues.forEach(value => listValuesControl.push(new FormControl(value)));
      console.log("Updated list_values after dialog:", updatedListValues);
    });
  }
  checkboxClicked(): void {
    const isForeignKeyChecked = this.fieldForm.get('is_foreign_key')?.value;
  
    if (isForeignKeyChecked) {
      // Only open the dialog if foreign key data isn't already set
      if (!this.referredFieldName || !this.referredTable) {
        this.openPopupDialog();
      }
    } else {
      // Reset fields if checkbox is unchecked
      this.referredFieldName = '';
      this.referredTable = '';
      this.FieldId = 0;
    }
  }
  // In ConceptionTableComponent
  openPopupDialog(): void {
    const dialogRef = this.dialog.open(ForeignKeyComponent, {
      width: '400px',
      height: '500px',
      data: { websiteId: this.websiteId }
    });
  
    // Subscribe to dialog data
    dialogRef.afterClosed().subscribe(result => {
      if (result) { // If data was selected and saved
        // Update foreign key fields
        this.referredFieldName = result.field.name;
        this.referredTable = result.table.name;
        this.FieldId = result.field.id;
  
        // Check the checkbox programmatically
        this.fieldForm.get('is_foreign_key')?.setValue(true);
      } else {
        // If dialog was closed without data, uncheck the checkbox
        this.fieldForm.get('is_foreign_key')?.setValue(false);
      }
    });
  }
  TS_createForeignKey(referredFieldName: String, FieldName: String, tableName: String, fieldData: any, update: boolean, fieldEdit: number | null): void {
    const foreignKeyData = {
      from_table: `${this.selectedTable.name}_${this.websiteId}`,
      to_table: `${tableName}_${this.websiteId}`,
      from_column: 'fk_' + fieldData.name,
      to_column: "id"
    };

    console.log("Foreign key data:", foreignKeyData);
    this.V_tableService.S_createDataAndForeignKey(fieldData, foreignKeyData, this.FieldId, update, fieldEdit).subscribe({
      next: () => {
        this.fields.push({ table: fieldData.table, table_id: fieldData.table, referedFieldId: this.FieldId, list_values: [], is_foreign_key: true, relatedField: fieldData.name });
        console.log('Foreign key created successfully');
      },
      error: (error) => {
        console.error('Error creating foreign key:', error);
      },
    });
  }

  TS_close() {
    this.closeTab.emit();
  }

  TS_initForm(originalFieldName: string | null = null): void {
    const tableId = this.selectedTable?.id || 0;
  
    this.fieldForm = this.formBuilder.group({
      name: ['', {
        validators: [Validators.required, Validators.maxLength(100)],
        asyncValidators: [FieldNameValidator(this.V_tableService, tableId, originalFieldName)],
        updateOn: 'blur'
      }],
      field_type: ['', Validators.required],
      tableId: [tableId],
      referedFieldId: [null],
      list_values: this.formBuilder.array([]),
      is_foreign_key: [false],
      relatedField: [''],
      required: [false] // Added required field
    });
  }

  TS_loadFields(tableId: number): void {
    this.V_tableService.S_getFieldsByTable(tableId).subscribe(
      (data) => {
        this.fields = data;
        this.TS_resetFieldForm();
      },
      (error) => {
        console.error('Error loading fields:', error);
        this.fields = [];
      }
    );
  }

  TS_loadTables(selectedTableId: number | null): void {
    this.V_tableService.S_getAllTables().subscribe((data) => {
      this.tables = data;
      if (this.tables.length > 0) {
        this.selectedTableId = selectedTableId !== null ? selectedTableId : this.tables[0].id;
        this.TS_loadFields(this.selectedTableId);
      }
    });
  }

  TS_addField(): void {
    this.TS_resetFieldForm();
    this.isFieldEditing = false;
    this.editingFieldId = 0;
    this.originalFieldName = null;
    this.TS_initForm();
  }

  TS_createField(): void {
    if (this.fieldForm.valid) {
      const fieldData = this.fieldForm.value;
      fieldData.table = this.selectedTable?.id;

      if (this.isFieldEditing && this.editingFieldId != null) {
        this.TS_updateField(this.editingFieldId, fieldData);
        this.TS_loadFields(this.selectedTable?.id);
      } else {
        if (this.fieldForm.get('is_foreign_key')?.value) {
          this.TS_createForeignKey(fieldData.name, this.referredFieldName, this.referredTable, fieldData, false, null);
        } else {
          this.V_tableService.S_createField(fieldData).subscribe({
            next: () => {
              console.log('Field created successfully', fieldData);
              this.TS_loadFields(this.selectedTable?.id);
            },
            error: (error) => {
              console.error('Error creating field:', error);
            },
          });
        }
        this.fields.push(fieldData);
      }
    }
    this.TS_resetFieldForm();
  }

  TS_updateField(fieldId: number, fieldData: any): void {
    const updateDataWithTableId = {
      ...fieldData,
      tableId: this.selectedTable?.id,
    };

    if (this.fieldForm.get('is_foreign_key')?.value) {
      this.TS_createForeignKey(fieldData.name, this.referredFieldName, this.referredTable, updateDataWithTableId, true, fieldId);
    } else {
      this.V_tableService.S_updateField(fieldId, updateDataWithTableId).subscribe({
        next: () => {
          console.log('Field updated successfully');
          this.TS_loadFields(this.selectedTable?.id);
          this.TS_resetFieldForm();
        },
        error: (error) => {
          console.error('Error updating field:', error);
        },
      });
    }
  }

  TS_editField(fieldId: number, fieldName: string, fieldType: string, listValues: any[] = [], required: boolean = false): void {
    this.isFieldEditing = true;
    this.editingFieldId = fieldId;
    this.originalFieldName = fieldName;
    this.TS_initForm(fieldName);
  
    this.fieldForm.setValue({
      name: fieldName,
      field_type: fieldType,
      tableId: this.selectedTable?.id,
      list_values: listValues || [],
      referedFieldId: null,
      is_foreign_key: false,
      relatedField: '',
      required: required // Set required value
    });
  
    if (fieldType === 'LIST') {
      this.TS_openListPopUp(listValues);
    }
  
    this.showFieldForm = true;
    this.TS_subscribeToFieldTypeChanges();
  }
  TS_resetFieldForm(): void {
    this.fieldForm.reset({
      tableId: this.selectedTable?.id,
      required: false // Explicitly reset 'required' to false
    });
    this.isFieldEditing = false;
    this.editingFieldId = 0;
    this.originalFieldName = null;
  }
  TS_deleteField(fieldId: number): void {
    const confirmDeletion = window.confirm('Are you sure you want to delete this field? This action cannot be undone.');

    if (confirmDeletion) {
      this.V_tableService.S_deleteField(fieldId).subscribe({
        next: () => {
          this.TS_loadFields(this.selectedTable?.id);
        },
        error: (error) => {
          console.error('Error deleting field:', error);
        },
      });
    }
  }

  TS_toggleFieldRequired(field: any): void {
    const updatedFieldData = {
      ...field,
      required: !field.required
    };

    // Update the field
    this.updateField(updatedFieldData);
  }

  updateField(updatedField: any): void {
    // Example: Update local state
    const index = this.fields.findIndex(f => f.id === updatedField.id);
    if (index !== -1) {
      this.fields[index] = updatedField;
    }

    // Example: Update backend via API
    this.V_tableService.S_updateField(updatedField.id, updatedField).subscribe(
      (response) => {
        console.log('Field updated successfully:', response);
      },
      (error) => {
        console.error('Error updating field:', error);
      }
    );
  }
  TS_toggleDetails() {
    this.showMoreDetails = !this.showMoreDetails;
  }
TS_toggleDataTab(): void {
    this.isDataTabActive = !this.isDataTabActive;
    this.isDataFormActive = false;
    this.isConceptionToolsActive = false;
    this.activeComponent = this.isDataTabActive ? 'dataTab' : '';
    this.isExcelActive = false;
  }

  TS_toggleDataForm(): void {
    this.isDataFormActive = !this.isDataFormActive;
    this.isDataTabActive = false;
    this.isConceptionToolsActive = false;
    this.activeComponent = this.isDataFormActive ? 'dataForm' : '';
    this.isExcelActive = false;
  }

  TS_toggleConceptionTools(): void {
    this.showConceptionTools = !this.showConceptionTools;
    this.isConceptionToolsActive = !this.isConceptionToolsActive;
    this.isDataTabActive = false;
    this.isDataFormActive = false;
    this.isExcelActive = false;

    if (!this.showConceptionTools) {
      this.showFieldForm = false;
      this.showSecondImage = false;
      this.TS_resetFieldForm();
    }
  }

  TS_toggleFieldFormVisibility(): void {
    this.showFieldForm = !this.showFieldForm;

    if (this.showFieldForm) {
      this.TS_resetFieldForm();
    }
    this.showSecondImage = !this.showSecondImage;
  }

  showSecondImage = false;

  TS_dragStart(event: DragEvent): void {
    const target = event.target as HTMLElement | null;
    if (target) {
      const rect = target.getBoundingClientRect();
      this.offsetX = event.clientX - rect.left;
      this.offsetY = event.clientY - rect.top;
    }
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  }

  TS_dragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement | null;
    if (target) {
      const x = event.clientX - this.offsetX;
      const y = event.clientY - this.offsetY;
      target.style.position = 'absolute';
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
    }
  }

  TS_toggleExcel(): void {
    this.isExcelActive = !this.isExcelActive;
    this.isDataFormActive = false;
    this.isDataTabActive = false;
    this.isConceptionToolsActive = false;
    this.activeComponent = this.isExcelActive ? 'excel' : '';
  }
}