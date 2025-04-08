import { Component, OnInit, HostListener } from '@angular/core';
import { faEdit, faPlus, faTimes, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { SidebarItem, Sidebar } from '../models/sidebar-item.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavbarHorizentalService } from '../services/navbar-horizental.service';

@Component({
  selector: 'app-navbar-horizontal',
  templateUrl: './navbar-horizontal.component.html',
  styleUrls: ['./navbar-horizontal.component.css']
})

export class NavbarHorizontalComponent /*implements OnInit*/ {/*
  
  navbarItems: SidebarItem[] = [];
  sidebars: Sidebar[] = [];
  selectedSidebar: Sidebar | null = null;
  filteredNavbarItems: SidebarItem[] = [];
  faEdit = faEdit;
  faPlus = faPlus;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  selectedItem: SidebarItem | null = null;
  openOptionMenuId: number | null = null;
  

  enableAddParent: boolean = true;
  enableAddChild: boolean = true;
  enableEdit: boolean = true;
  enableDelete: boolean = true;
  enableReorder: boolean = true;
  enableMoveToParent: boolean = true;
  settingsMenuVisible: boolean = false;
  isStyleMenuVisible: boolean = false;
  currentTheme: string = 'default';

  constructor(private navbarService: NavbarHorizentalService) { }

  ngOnInit(): void {
    this.loadSidebars();
    this.applyTheme(this.currentTheme);
  }

  loadSidebars(): void {
    this.navbarService.getSidebars().subscribe(data => {
      this.sidebars = data;
      console.log('Sidebars loaded:', this.sidebars);
      if (this.sidebars.length > 0) {
        this.selectedSidebar = this.sidebars[0];
        this.loadNavbarItems();
      }
    });
  }

  loadNavbarItems(): void {
    const currentExpandedStates = this.getCurrentExpandedStates(this.navbarItems);
    this.navbarService.getNavbarItems(this.selectedSidebar?.id).subscribe(data => {
      this.navbarItems = this.buildTree(data, null);
      this.restoreExpandedStates(this.navbarItems, currentExpandedStates);
      console.log('Navbar items loaded:', this.navbarItems);
    });
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
        isExpanded: false 
      }));
  }

  drop(event: CdkDragDrop<SidebarItem[]>, list: SidebarItem[]): void {
    if (!this.enableReorder) return;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.updateOrder(this.navbarItems);
  }

  openMoveModal(item: SidebarItem): void {
    if (!this.enableMoveToParent) return;
    this.selectedItem = item;
    this.filteredNavbarItems = this.getFilteredItems(item, this.navbarItems);
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
    if (item && newParent) {
      item.parent = newParent.id;
      this.navbarService.updateNavbarItem(item.id, item).subscribe(() => {
        this.loadNavbarItems();
        this.closeMoveModal();
        this.closeOptionMenu();
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
      this.navbarService.updateNavbarItem(item.id, item).subscribe({
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
      order = (this.navbarItems.length + 1).toString();
    }
    const title = `${order} : new item `;
    const newItem: SidebarItem = {
      id: 0,
      title,
      url: '',
      parent: parent ? parent.id : null,
      order,
      children: [],
      sidebar: this.selectedSidebar ? this.selectedSidebar.id : null, // Ajoutez cette ligne
      isEditing: false,
      isExpanded: false
    };
    this.navbarService.addNavbarItem(newItem).subscribe(() => {
      this.loadNavbarItems();
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
    this.navbarService.updateNavbarItem(item.id, item).subscribe({
      error: (err) => console.error('Error updating item:', err)
    });
    this.closeOptionMenu();
  }

  deleteItem(item: SidebarItem): void {
    if (!this.enableDelete) return;
    this.navbarService.deleteNavbarItem(item.id).subscribe(() => {
      this.loadNavbarItems();
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
    event.stopPropagation();
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

  toggleChildrenVisibility(item: SidebarItem): void {
    item.isExpanded = !item.isExpanded;
  }

  toggleSettingsMenu(): void {
    this.settingsMenuVisible = !this.settingsMenuVisible;
  }

  showStyleMenu(): void {
    this.isStyleMenuVisible = true;
  }

  showToggleMenu(): void {
    this.isStyleMenuVisible = false;
  }

  applyTheme(theme: string): void {
    this.currentTheme = theme;
    const navbarElement = this.navbarElement;
    navbarElement.classList.remove('default-theme', 'nature-theme', 'modern-theme', 'dark-theme', 'light-theme');
    switch (theme) {
      case 'nature':
        navbarElement.classList.add('nature-theme');
        break;
      case 'modern':
        navbarElement.classList.add('modern-theme');
        break;
      case 'dark':
        navbarElement.classList.add('dark-theme');
        break;
      case 'light':
        navbarElement.classList.add('light-theme');
        break;
      default:
        navbarElement.classList.add('default-theme');
        break;
    }
    this.showToggleMenu();
  }

  get navbarElement(): HTMLElement {
    return document.querySelector('.navbar-horizontal') as HTMLElement;
  }*/
}
