//niv1 ts
import { Component, OnInit } from '@angular/core';
import { S_CategoryService } from '../../services/categService/Category.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryNameValidator } from '../validators/categoryValidator';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-all-categories',
  templateUrl: './all-categories.component.html',
  styleUrls: ['./all-categories.component.css']
})
export class AllCategoriesComponent implements OnInit {
  // Properties
  showGestionControls: boolean = false;
  showCreateForm: boolean = false;
  offsetX: number = 0;
  offsetY: number = 0;
  categories: any[] = [];
  selectedCategory: any;
  showS6o4o3allTables: boolean = false;
  categoryForm: FormGroup;
  isEditing: boolean = false;
  editingCategoryId: number | null = null;
  websiteId?: number;
  nonClassifiedCategory: any;

  // Constructor
  constructor(
    private V_categoryService: S_CategoryService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      parent: [null]
    });
  }

  // Lifecycle Hook
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      this.TS_loadCategories();
    });
    this.checkAndCreateNonClassifiedCategory();
    this.TS_loadCategories();
  }

  // Template Interaction Methods
  TS_selectCategory(category: any): void {
    this.selectedCategory = category;
    this.showS6o4o3allTables = true;
  }

  TS_handleGestion(): void {
    this.showGestionControls = !this.showGestionControls;
    this.showCreateForm = false;
    if (!this.showGestionControls) {
      this.isEditing = false;
    }
  }

  TS_toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  TS_editCategory(categoryId: number, categoryName: string): void {
    this.isEditing = true;
    this.editingCategoryId = categoryId;
    this.categoryForm.patchValue({
      name: categoryName,
      parent: this.selectedCategory.parent ? this.selectedCategory.parent.id : null
    });
    this.showGestionControls = true;
    this.categoryForm.get('name')?.setValidators([Validators.required, CategoryNameValidator(this.categories, categoryName)]);
    this.categoryForm.get('name')?.updateValueAndValidity();
  }

  TS_deleteCategory(event: MouseEvent, categoryId: number): void {
    event.stopPropagation();
    const confirmDeletion = window.confirm('Are you sure you want to delete this category? This action cannot be undone.');
    if (confirmDeletion) {
      this.V_categoryService.S_deleteCategoryWithReplacement(categoryId, this.nonClassifiedCategory.id).subscribe(() => {
        this.TS_loadCategories();
        this.TS_resetForm();
      });
    }
  }

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

  submitForm(): void {
    if (this.isEditing) {
      this.TS_updateCategory();
    } else {
      this.TS_createCategory();
    }
  }

  // Form Management Methods
  TS_resetForm(): void {
    this.categoryForm.reset();
    this.isEditing = false;
    this.editingCategoryId = null;
  }

  TS_cancelEdit(): void {
    this.isEditing = false;
    this.TS_resetForm();
    this.showGestionControls = false;
    this.showCreateForm = false;
  }

  // Data Management Methods
  TS_loadCategories(): void {
    this.V_categoryService.getCategoriesByWebsiteId(this.websiteId!).subscribe(categories => {
      this.categories = categories.sort((a, b) => {
        if (a.name === 'Non Classified') return -1;
        if (b.name === 'Non Classified') return 1;
        return a.name.localeCompare(b.name);
      });
      this.categoryForm.get('name')?.setValidators([Validators.required, CategoryNameValidator(this.categories, null)]);
      this.categoryForm.get('name')?.updateValueAndValidity();
    });
  }

  TS_createCategory(): void {
    const categoryData = this.categoryForm.value;
    categoryData.website = this.websiteId;
    if (!categoryData.parent) {
      delete categoryData.parent;
    }
    this.V_categoryService.S_createCategory(categoryData).subscribe(() => {
      this.TS_loadCategories();
      this.categoryForm.reset({ name: '', parent: null });
    });
  }

  TS_updateCategory(): void {
    if (this.categoryForm.valid && this.editingCategoryId !== null) {
      const categoryData = this.categoryForm.value;
      this.V_categoryService.S_updateCategory(this.editingCategoryId, categoryData).subscribe(() => {
        this.TS_loadCategories();
        this.TS_resetForm();
        this.showGestionControls = false;
      });
    }
  }

  checkAndCreateNonClassifiedCategory() {
    this.V_categoryService.getCategoriesByWebsiteId(this.websiteId!).subscribe(categories => {
      this.nonClassifiedCategory = categories.find(cat => cat.name === 'Non Classified');
      if (!this.nonClassifiedCategory) {
        const categoryData = {
          name: 'Non Classified',
          website: this.websiteId
        };
        this.V_categoryService.S_createCategory(categoryData).subscribe(response => {
          this.nonClassifiedCategory = response;
          this.TS_loadCategories();
        }, error => {
          console.error('Error creating category:', error);
        });
      }
    }, error => {
      console.error('Error fetching categories:', error);
    });
  }
}
