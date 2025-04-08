//niv 7 from-dbdialog
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseSelectorComponent } from '../database-selector/database-selector.component';
import { S_CategoryService } from '../../../services/categService/Category.service';
import { CategoryNameValidator } from '../../validators/categoryValidator';

@Component({
  selector: 'app-from-dbdialog',
  templateUrl: './from-dbdialog.component.html',
  styleUrls: ['./from-dbdialog.component.css']
})
export class FromDBDialogComponent implements OnInit {
  VarTab_databaseForm: FormGroup;
  @Output() VarS_values = new EventEmitter<string[]>();
  categories: any[] = []; // Add this line to store categories
  websiteId: number = 1; // Example website ID, adjust as needed

  constructor(
    private TS_fb: FormBuilder,
    private TS_dialogRef: MatDialogRef<DatabaseSelectorComponent>,
    private TS_dialog: MatDialog,
    private V_categoryService: S_CategoryService // Add this line to inject CategoryService
  ) {
    this.VarTab_databaseForm = this.TS_fb.group({
      VarS_databaseName: ['', Validators.required],
      VarS_username: ['', Validators.required],
      VarS_password: ['', Validators.required],
      VarS_host: ['', Validators.required],
      VarN_port: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.TS_loadCategories(); // Call the function to load categories on component initialization
  }

  TS_loadCategories(): void {
    this.V_categoryService.getCategoriesByWebsiteId(this.websiteId).subscribe(categories => {
      this.categories = categories.sort((a, b) => {
        if (a.name === 'Non Classified') return -1;
        if (b.name === 'Non Classified') return 1;
        return a.name.localeCompare(b.name);
      });
      this.VarTab_databaseForm.get('VarS_databaseName')?.setValidators([Validators.required, CategoryNameValidator(this.categories, null)]);
      this.VarTab_databaseForm.get('VarS_databaseName')?.updateValueAndValidity();
    });
  }

  TS_onSubmit(): void {
    if (this.VarTab_databaseForm.valid) {
      const VarTab_connectionDetails = this.VarTab_databaseForm.value;
      this.TS_dialogRef.close();
      this.TS_openDatabaseSelectorDialog(VarTab_connectionDetails);
    }
  }

  TS_openDatabaseSelectorDialog(VarTab_connectionDetails: any): void {
    const TS_dialogRef = this.TS_dialog.open(DatabaseSelectorComponent, {
      data: { VarTab_connectionDetails }
    });

    TS_dialogRef.componentInstance.VarS_values.subscribe(
      (VarS_values: string[]) => {
        this.VarS_values.emit(VarS_values);
      },
      (VarS_error: any) => {
        console.error('Error fetching values:', VarS_error);
      }
    );

    TS_dialogRef.afterClosed().subscribe((VarS_result) => {
      console.log('Database Selector closed', VarS_result);
    });
  }

  TS_closeDialog(): void {
    this.TS_dialogRef.close();
  }
}