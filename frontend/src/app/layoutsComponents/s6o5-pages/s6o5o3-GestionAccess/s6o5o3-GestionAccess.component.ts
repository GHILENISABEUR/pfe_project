import { S_CategoryService } from 'src/app/GestionAuth/services/categService/Category.service';
import { S_TableService } from 'src/app/GestionAuth/services/TableService/Table.service'; 
import { Component, OnInit } from '@angular/core';
import { S_AuthService } from 'src/app/GestionAuth/services/authentifService/auth.service';

@Component({
  selector: 'app-s6o5o3-GestionAccess',
  templateUrl: './s6o5o3-GestionAccess.component.html',
  styleUrls: ['./s6o5o3-GestionAccess.component.css'],
})
export class S6o5o3GestionAccessComponent implements OnInit {
  tables: any[] = [];
  categories: any[] = [];
  tablesSelected: boolean[] = [];
  categoriesSelected: boolean[] = [];
  allTablesSelected = false;
  allCategoriesSelected = false;
  users: any[] = [];

  constructor(
    public V_authService: S_AuthService,
    public V_categoryService: S_CategoryService,
    public V_TableService: S_TableService,
  ) {}

  sections = [
    { title: 'Tables and Categories', content: '', open: false },
    { title: 'USERS', content: '', open: false },
    { title: 'GIA', content: '', open: true },
  ];

  ngOnInit(): void {
    this.TS_LoadTablesAndCategories();
  }

  TS_LoadTablesAndCategories(): void {
    this.V_TableService.S_getAllTables().subscribe((tables) => {
      this.tables = tables;
    })
    this.V_categoryService.S_getAllCategories().subscribe((categories) => {
      this.categories = categories;
    })
  }

  TS_ToggleSection(index: number): void {
    this.sections[index].open = !this.sections[index].open;
    if (index === 0 && this.sections[0].open) {
      this.TS_LoadTablesAndCategories();
    }
  }

  TS_ToggleAllTables(): void {
    this.allTablesSelected = !this.allTablesSelected; // Toggle the state of the master checkbox
    this.tablesSelected.fill(this.allTablesSelected); // Set all individual checkboxes to the master's state
  }

  TS_ToggleTableSelection(index: number): void {
    this.tablesSelected[index] = !this.tablesSelected[index];
    this.allTablesSelected = this.tablesSelected.every(Boolean); // Check if all are selected
  }

  TS_ToggleAllCategories(): void {
    this.allCategoriesSelected = !this.allCategoriesSelected; // Toggle the state of the master checkbox
    this.categoriesSelected.fill(this.allCategoriesSelected); // Set all individual checkboxes to the master's state
  }

  TS_ToggleCategorySelection(index: number): void {
    this.categoriesSelected[index] = !this.categoriesSelected[index];
    this.allCategoriesSelected = this.categoriesSelected.every(Boolean); // Check if all are selected
  }




}
