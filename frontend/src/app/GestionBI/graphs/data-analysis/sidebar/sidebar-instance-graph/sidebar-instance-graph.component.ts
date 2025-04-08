import { Component , Input, OnInit, Output, EventEmitter, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { GraphsService } from 'src/app/services/Graphs/graphs.service';
import { faEdit, faPlus, faTimes, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { SidebarItem, Sidebar } from 'src/app/models/sidebar-item-graph.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-sidebar-instance-graph',
  templateUrl: './sidebar-instance-graph.component.html',
  styleUrls: ['./sidebar-instance-graph.component.css']
})
export class SidebarInstanceGraphComponent implements OnInit, AfterViewInit {
  @Input() sidebar!: Sidebar;
  @Output() delete = new EventEmitter<Sidebar>();
  @Output() itemSelect = new EventEmitter<SidebarItem>();
  @Input() websiteId!: number; // Receive websiteId from parent component




  

  @Output() itemSelected = new EventEmitter<SidebarItem>(); // Emit selected item

  sidebarItems: SidebarItem[] = [];
  filteredSidebarItems: SidebarItem[] = [];
  faEdit = faEdit;
  faPlus = faPlus;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  selectedItem: SidebarItem | null | undefined = null;

  // Track the open option menu
  openOptionMenuId: number | null = null;

  // Toggle Switch states
  enableAddParent: boolean = true;
  enableAddChild: boolean = true;
  enableEdit: boolean = true;
  enableDelete: boolean = true;
  enableReorder: boolean = true;
  enableMoveToParent: boolean = true;
  enableMoveSidebar: boolean = false;
  enableResizeSidebar: boolean = false;
  initialSidebarWidth: number = 0;

  isDragging: boolean = false;
  initialSidebarX: number = 0;
  initialSidebarY: number = 0;
  initialMouseX: number = 0;
  initialMouseY: number = 0;

  settingsMenuVisible: boolean = false;
  isStyleMenuVisible: boolean = false;
  currentTheme: string = 'default';

  constructor(private graphsService: GraphsService,private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log('Initializing sidebar instance for sidebar:', this.sidebar);
    this.loadSidebarItems(this.sidebar.id);
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    console.log('After view init for sidebar:', this.sidebar);
    this.loadSidebarSettings();
    this.applyTheme(this.sidebar.style || this.currentTheme);
  }

  loadSidebarSettings(): void {
    const sidebarElement = this.sidebarElement;

    if (!sidebarElement) {
      console.error('Sidebar element not found for sidebar:', this.sidebar);
      return;
    }

    // Apply position and dimensions
    if (this.sidebar.position_x !== undefined && this.sidebar.position_y !== undefined) {
      sidebarElement.style.left = `${this.sidebar.position_x}px`;
      sidebarElement.style.top = `${this.sidebar.position_y}px`;
    }

    if (this.sidebar.width !== undefined) {
      sidebarElement.style.width = `${this.sidebar.width}px`;
    }

    if (this.sidebar.height !== undefined) {
      sidebarElement.style.height = `${this.sidebar.height}px`;
    }

    // Load toggle states
    this.enableAddParent = this.sidebar.toggles.enableAddParent !== undefined ? this.sidebar.toggles.enableAddParent : true;
    this.enableAddChild = this.sidebar.toggles.enableAddChild !== undefined ? this.sidebar.toggles.enableAddChild : true;
    this.enableEdit = this.sidebar.toggles.enableEdit !== undefined ? this.sidebar.toggles.enableEdit : true;
    this.enableDelete = this.sidebar.toggles.enableDelete !== undefined ? this.sidebar.toggles.enableDelete : true;
    this.enableReorder = this.sidebar.toggles.enableReorder !== undefined ? this.sidebar.toggles.enableReorder : true;
    this.enableMoveToParent = this.sidebar.toggles.enableMoveToParent !== undefined ? this.sidebar.toggles.enableMoveToParent : true;
    this.enableMoveSidebar = this.sidebar.toggles.enableMoveSidebar !== undefined ? this.sidebar.toggles.enableMoveSidebar : false;
    this.enableResizeSidebar = this.sidebar.toggles.enableResizeSidebar !== undefined ? this.sidebar.toggles.enableResizeSidebar : false;
  }

  loadSidebarItems(sidebarId: number): void {
    if (!this.websiteId) {
      console.error('Website ID is not set');
      return;
    }
  
    console.log('Loading sidebar items for sidebar ID:', sidebarId);
    this.graphsService.getSidebarItems(sidebarId, this.websiteId).subscribe(data => {
      this.sidebarItems = this.buildTree(data, null);
      console.log('Loaded sidebar items:', this.sidebarItems);
    }, error => {
      console.error('Error loading sidebar items:', error);
    });
  }

  

  saveSidebarSettings(): void {
    const sidebarElement = this.sidebarElement;
    if (!sidebarElement) {
      console.error('Cannot save settings, sidebar element not found for:', this.sidebar);
      return;
    }

    const updatedSidebar = {
      ...this.sidebar,
      position_x: sidebarElement.offsetLeft,
      position_y: sidebarElement.offsetTop,
      width: sidebarElement.offsetWidth,
      height: sidebarElement.offsetHeight,
      toggles: {
        enableAddParent: this.enableAddParent,
        enableAddChild: this.enableAddChild,
        enableEdit: this.enableEdit,
        enableDelete: this.enableDelete,
        enableReorder: this.enableReorder,
        enableMoveToParent: this.enableMoveToParent,
        enableMoveSidebar: this.enableMoveSidebar,
        enableResizeSidebar: this.enableResizeSidebar
      }
    };

    this.graphsService.updateSidebar(this.sidebar.id, updatedSidebar).subscribe(
      () => console.log('Sidebar settings saved'),
      (error) => console.error('Error saving sidebar settings:', error)
    );
  }

  getCurrentExpandedStates(items: SidebarItem[]): { [key: number]: boolean } {
    const states: { [key: number]: boolean } = {};
    const traverse = (items: SidebarItem[]) => {
      items.forEach(item => {
        states[item.id] = item.isExpanded;
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(items);
    return states;
  }

  restoreExpandedStates(items: SidebarItem[], states: { [key: number]: boolean }): void {
    const traverse = (items: SidebarItem[]) => {
      items.forEach(item => {
        item.isExpanded = states[item.id] || false;
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(items);
  }

   buildTree(items: SidebarItem[], parentId: number | null): SidebarItem[] {
    return items
      .filter(item => item.parent === parentId)
      .map(item => ({
        ...item,
        children: this.buildTree(items, item.id),
        isEditing: false,
        isExpanded: false,
        isSelected: false
      }));
  }


  drop(event: CdkDragDrop<SidebarItem[]>, list: SidebarItem[]): void {
    if (!this.enableReorder) return;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.updateOrder(this.sidebarItems);
  }

  openMoveModal(item: SidebarItem): void {
    if (!this.enableMoveToParent) return;
    this.selectedItem = item;
    this.filteredSidebarItems = this.getFilteredItems(item, this.sidebarItems);
    const modal = document.getElementById("moveModal");
    if (modal) {
      modal.style.display = "block";
      setTimeout(() => {
        modal.style.opacity = '1';
      }, 0);
    }
  }

  closeMoveModal(): void {
    const modal = document.getElementById("moveModal");
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
    }
    this.selectedItem = null;
  }

  moveItemToParent(item: SidebarItem, newParent: SidebarItem): void {
    console.log('Trying to move item:', item, 'to new parent:', newParent);
    if (item && newParent) {
      item.parent = newParent.id;
      console.log('New parent ID set to:', newParent.id);
      
      // Check if the item ID is valid
      if (!item.id) {
        console.error('Item ID is not valid for update:', item);
        return;  // Prevent the update if ID is not valid
      }
  
      this.graphsService.updateSidebarItem(item.id, item).subscribe(() => {
        console.log('Item updated:', item);
        this.loadSidebarItems(this.sidebar.id);
        this.closeMoveModal();
        this.closeOptionMenu();
      }, error => {
        console.error('Error updating item:', error);  // Enhanced error logging
      });
    }
  }
  

  handleMove(newParent: SidebarItem): void {
    if (this.selectedItem) {
      this.moveItemToParent(this.selectedItem, newParent);
    }
  }

  updateOrder(items: SidebarItem[], parent: SidebarItem | null = null): void {
    items.forEach((item, index) => {
      const parentOrder = parent ? parent.order : '';
      item.order = parentOrder ? `${parentOrder}.${index + 1}` : (index + 1).toString();
      item.parent = parent ? parent.id : null;
      console.log(`Updating item: ${item.title}, New order: ${item.order}, New parent: ${item.parent}`);
      this.graphsService.updateSidebarItem(item.id, item).subscribe({
        error: (err) => console.error('Error updating item:', err)
      });

      if (item.children) {
        this.updateOrder(item.children, item);
      }
    });
  }

  addItem(parent: SidebarItem | null): void {
    if (!this.enableAddParent && parent === null) return;
    if (!this.enableAddChild && parent !== null) return;
  
    let order: string;
    if (parent) {
      const parentOrder = parent.order;
      const childrenCount = parent.children ? parent.children.length : 0;
      order = `${parentOrder}.${childrenCount + 1}`;
      parent.isExpanded = true;
    } else {
      order = (this.sidebarItems.length + 1).toString();
    }
    const title = `${order} : new item `;
    const newItem: SidebarItem = {
      id: 0,
      title,
      url: '',
      parent: parent ? parent.id : null,
      order,
      children: [],
      sidebar: this.sidebar.id,
      linked_sidebar: null,
      isEditing: false,
      isExpanded: false,
      websiteId: this.websiteId  // Ensure websiteId is set correctly
    };
    console.log('Adding new item:', newItem);
    this.graphsService.addSidebarItem(newItem).subscribe(() => {
      this.loadSidebarItems(this.sidebar.id);
      this.closeOptionMenu();
    });
  }
  

  editItem(item: SidebarItem): void {
    if (!this.enableEdit) return;
    item.isEditing = true;
    this.closeOptionMenu();
  }

  saveItem(item: SidebarItem): void {
    item.isEditing = false;
    console.log('Saving item:', item);
    this.graphsService.updateSidebarItem(item.id, item).subscribe({
      error: (err) => console.error('Error updating item:', err)
    });
    this.closeOptionMenu();
  }

  deleteItem(item: SidebarItem): void {
    if (!this.enableDelete) return;
    console.log('Deleting item:', item);
    this.graphsService.deleteSidebarItem(item.id).subscribe(() => {
      this.loadSidebarItems(this.sidebar.id);
      this.closeOptionMenu();
    });
  }

  getFilteredItems(item: SidebarItem | null, items: SidebarItem[]): SidebarItem[] {
    if (!item) {
      return items;
    }

    const filterItem = (itemToFilter: SidebarItem, itemsToFilter: SidebarItem[]): SidebarItem[] => {
      return itemsToFilter.filter(i => i.id !== itemToFilter.id).map(i => ({
        ...i,
        children: filterItem(itemToFilter, i.children || [])
      }));
    };

    return filterItem(item, items);
  }

  toggleOptionMenu(event: MouseEvent, itemId: number): void {
    event.stopPropagation(); // Prevent event from bubbling up to the document
    if (this.openOptionMenuId === itemId) {
      this.openOptionMenuId = null;
    } else {
      this.openOptionMenuId = itemId;
    }
    this.updateOptionMenuVisibility(event);
  }

  closeOptionMenu(): void {
    this.openOptionMenuId = null;
    this.updateOptionMenuVisibility();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (this.openOptionMenuId !== null && !this.isClickInsideOptionMenu(event)) {
      this.closeOptionMenu();
    }
  }

  isClickInsideOptionMenu(event: Event): boolean {
    const target = event.target as HTMLElement;
    return target.closest('.options-button') !== null || target.closest('.item-buttons') !== null;
  }

  updateOptionMenuVisibility(event?: MouseEvent): void {
    const buttons = document.querySelectorAll('.item-buttons');
    buttons.forEach(button => {
      const itemId = parseInt(button.getAttribute('data-item-id') || '', 10);
      if (itemId === this.openOptionMenuId) {
        button.classList.add('visible');
        if (event) {
          const target = event.target as HTMLElement;
          const rect = target.getBoundingClientRect();
          button.setAttribute('style', `top: ${rect.bottom + window.scrollY}px; left: ${rect.left + window.scrollX}px;`);
        }
      } else {
        button.classList.remove('visible');
        button.removeAttribute('style');
      }
    });
  }

  toggleChildrenVisibility(item: SidebarItem, event: MouseEvent): void {
    event.stopPropagation();  // Prevent the click from affecting parent elements
    item.isExpanded = !item.isExpanded;
    this.cdr.detectChanges();  // Update the view
  }
  

  toggleSettingsMenu(): void {
    this.settingsMenuVisible = !this.settingsMenuVisible;
  }

  applyTheme(theme: string): void {
    const sidebarElement = this.sidebarElement;
    if (!sidebarElement) {
      console.error('Cannot apply theme, sidebar element not found');
      return;
    }
  
    // Liste des thèmes disponibles
    const themes = ['default-theme', 'nature-theme', 'modern-theme', 'dark-theme', 'light-theme'];
  
    // Retirer toutes les classes de thème précédentes
    themes.forEach(t => sidebarElement.classList.remove(t));
  
    // Ajouter la nouvelle classe de thème
    sidebarElement.classList.add(theme + '-theme');
    this.currentTheme = theme;
  
    // Sauvegarder le style dans la base de données
    this.graphsService.updateSidebarStyle(this.sidebar.id, theme).subscribe(
      () => console.log(`Applied and saved theme: ${theme}`),
      (error) => console.error('Error saving sidebar style:', error)
    );
  }

  deleteSidebar(): void {
    this.delete.emit(this.sidebar);
  }

  // In SidebarInstanceGraphComponent
selectItem(item: SidebarItem, event: MouseEvent): void {
  event.stopPropagation();  // Stop the event from bubbling up

  if (item.isSelected) {
    item.isSelected = false;
    this.selectedItem = undefined;  // Deselect the item
    this.itemSelected.emit(undefined);  // Emit undefined if no item is selected
  } else {
    this.deselectAllItems(this.sidebarItems);  // Deselect all other items
    item.isSelected = true;  // Select the clicked item
    this.selectedItem = item;  // Set as currently selected item
    this.itemSelected.emit(item);  // Emit the selected item when it's selected
  }

  this.cdr.detectChanges();  // Update the view
}

  
  /*cahngemeeeeeent*/


  deselectAllItems(items: SidebarItem[]): void {
    items.forEach(item => {
      if (item.isSelected) {
        console.log('Deselecting item:', item);
        item.isSelected = false;  // Reset selection state for each item
      }
      if (item.children) {
        this.deselectAllItems(item.children);  // Recursively reset for children
      }
    });
  }
  










  

  onSidebarResizeMouseDown(event: MouseEvent): void {
    if (!this.enableResizeSidebar) return;
    this.initialMouseX = event.clientX;
    if (this.sidebarElement) {
      this.initialSidebarWidth = this.sidebarElement.offsetWidth;
    }
    document.addEventListener('mousemove', this.onSidebarResizeMouseMove);
    document.addEventListener('mouseup', this.onSidebarResizeMouseUp);
  }
  
  onSidebarResizeMouseMove = (event: MouseEvent): void => {
    if (!this.sidebarElement) return;
    const deltaX = event.clientX - this.initialMouseX;
    const newWidth = this.initialSidebarWidth + deltaX;
    if (newWidth > 100) { // Minimum width
      this.sidebarElement.style.width = `${newWidth}px`;
    }
  };
  
  onSidebarResizeMouseUp = (): void => {
    document.removeEventListener('mousemove', this.onSidebarResizeMouseMove);
    document.removeEventListener('mouseup', this.onSidebarResizeMouseUp);
    this.saveSidebarSettings();  // Save settings after resizing the sidebar
  };
  
  onSidebarMoveMouseDown(event: MouseEvent): void {
    if (!this.enableMoveSidebar) return;
    this.isDragging = true;
    this.initialMouseX = event.clientX;
    this.initialMouseY = event.clientY;
    if (this.sidebarElement) {
      this.initialSidebarX = this.sidebarElement.offsetLeft;
      this.initialSidebarY = this.sidebarElement.offsetTop;
    }
    document.addEventListener('mousemove', this.onSidebarMoveMouseMove);
    document.addEventListener('mouseup', this.onSidebarMoveMouseUp);
  }
  
  onSidebarMoveMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging || !this.sidebarElement) return;
    const deltaX = event.clientX - this.initialMouseX;
    const deltaY = event.clientY - this.initialMouseY;
    this.sidebarElement.style.left = `${this.initialSidebarX + deltaX}px`;
    this.sidebarElement.style.top = `${this.initialSidebarY + deltaY}px`;
  };
  
  onSidebarMoveMouseUp = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onSidebarMoveMouseMove);
    document.removeEventListener('mouseup', this.onSidebarMoveMouseUp);
    this.saveSidebarSettings();  // Save settings after moving the sidebar
  };

  

  get sidebarElement(): HTMLElement | null {
    const element = document.querySelector(`.sidebar-${this.sidebar.id}`) as HTMLElement;
    if (!element) {
      console.error(`Sidebar element not found for selector: .sidebar-${this.sidebar.id}`);
      return null;
    }
    return element;
  }
}
