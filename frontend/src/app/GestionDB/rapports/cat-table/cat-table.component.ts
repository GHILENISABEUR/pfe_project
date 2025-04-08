import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { S_TableService } from 'src/app/GestionAuth/services/TableService/Table.service';
// import { S_CategoryService } from 'src/app/GestionAuth/services/categService/Category.service';
import { S_CategoryService } from '../../services/categService/Category.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cat-table',
  templateUrl: './cat-table.component.html',
  styleUrls: ['./cat-table.component.css']
})


export class CatTableComponent implements OnInit {
  cards: { title: string; description: string[]; selectable?: boolean; droppable?: boolean }[] = [
    { title: 'Categories', description: [], selectable: true },
    { title: 'Tables', description: [] },
    { title: 'Rapports', description: [] },
    { title: 'Selected', description: [], droppable: true }
  ];
  @Output() selectedTablesChange = new EventEmitter<any[]>();
  websiteId?:number;

  constructor(private cdr: ChangeDetectorRef,private V_categoryService: S_CategoryService,private route:ActivatedRoute, private V_tableService: S_TableService) { }

  ngOnInit() {
    this.TS_loadCategories();
    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ",this.websiteId )
      this.TS_loadCategories();    });

  }
  categories:any;
  TS_loadCategories(): void {
    this.V_categoryService.getCategoriesByWebsiteId(this.websiteId!).subscribe(categories => {
      this.categories = categories.sort((a, b) => {
        if (a.name === 'Non Classified') return -1;
        if (b.name === 'Non Classified') return 1;
        return a.name.localeCompare(b.name);
      });
      this.cards[0].description = categories.map(cat => cat.name);
    });
  }

  // ngOnInit() {

  //   this.route.paramMap.subscribe(params => {
  //     this.websiteId = +params.get('id')!;
  //     console.log("this.websiteId ",this.websiteId )
  //     this.TS_loadCategories();    });


  // }

  // TS_loadCategories(): void {
  //   this.V_categoryService.getCategoriesByWebsiteId(this.websiteId!).subscribe(categories => {
  //     this.categories = categories;
  //     this.categoryForm.get('name')?.setValidators([Validators.required, CategoryNameValidator(this.categories,null)]);
  //     this.categoryForm.get('name')?.updateValueAndValidity();
  //   });

  // }

  TS_onCategorySelect(categoryName: string): void {
    this.V_categoryService.getCategoriesByWebsiteId(this.websiteId!).subscribe(categories => {
      const selectedCategory = categories.find(cat => cat.name === categoryName);
      if (selectedCategory) {
        this.V_tableService.S_getTablesByCategoryId(selectedCategory.id).subscribe(tables => {


const tabless =tables.map(table => {
  return {
      ...table,
      name: table.name.replace(`_${this.websiteId}`, '') // Retirer l'ID du site Web
  };
});
   this.cards[1].description = tabless.map(table => table.name);

        });
      }
    });
  }

  TS_unselectTable(tableName: string, event: MouseEvent): void {
    event.stopPropagation(); // Prevent triggering any other click events
    const index = this.cards[3].description.indexOf(tableName);
    if (index > -1) {
      this.cards[3].description.splice(index, 1); // Remove the table from the list
      this.selectedTablesChange.emit(this.cards[3].description); // Update the parent component
    }
  }
  TS_toggleTableSelection(tableName: string): void {
    if (this.cards[3].title === 'Selected') {
      const selectedTablesIndex = this.cards[3].description.indexOf(tableName);
      if (selectedTablesIndex !== -1) {
        // Table is already selected, so unselect it
        this.cards[3].description.splice(selectedTablesIndex, 1);
      } else {
        // Table is not selected, so select it
        this.cards[3].description.push(tableName);
      }
    }      this.selectedTablesChange.emit(this.cards[3].description); // Emit the list of table names

  }

  TS_allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  TS_onDrop(event: DragEvent, card: any): void {
    event.preventDefault();
    if (event.dataTransfer && card.droppable) {
      const data = event.dataTransfer.getData("text");
      if (card.title === 'Selected') {
        card.description.push(data);
        this.selectedTablesChange.emit(this.cards[3].description);
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    }
  }

  TS_onDragStart(event: DragEvent, tableName: string): void {
    event.dataTransfer?.setData('text/plain', tableName);
  }
}
