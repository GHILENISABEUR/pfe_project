import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { SidebarService } from 'src/app/services/sidebar.service';
import { Sidebar, SidebarItem } from 'src/app/models/sidebar-item.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  sidebars: Sidebar[] = [];
  faPlus = faPlus;
  selectedItem: SidebarItem | null = null;
  activeSidebar: Sidebar | null = null;
  defaultSidebar: Sidebar | null = null;

  constructor(private sidebarService: SidebarService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadSidebars();
  }

  loadSidebars(): void {
    this.sidebarService.getSidebars().subscribe(data => {
        this.sidebars = data;
        if (this.sidebars.length === 0) {
            this.addDefaultSidebar();
        } else {
            this.setDefaultSidebar();
        }
    });
  }

  addDefaultSidebar(): void {
    const defaultSidebar: Sidebar = {
      id: 0,
      name: 'Default Sidebar',
      style: 'default',
      position_x: 100,
      position_y: 100,
      width: 300,
      height: 300,
      toggles: {
        enableAddParent: true,
        enableAddChild: true,
        enableEdit: true,
        enableDelete: true,
        enableReorder: true,
        enableMoveToParent: true,
        enableMoveSidebar: true,
        enableResizeSidebar: false
      },
      isDisplayed: true
    };
    this.sidebarService.addSidebar(defaultSidebar).subscribe(sidebar => {
      this.sidebars.push(sidebar);
      this.setDefaultSidebar();
      this.cdr.detectChanges();
    }, error => {
      console.error('Error adding default sidebar:', error);
    });
  }

  setDefaultSidebar(): void {
    this.defaultSidebar = this.sidebars.find(sb => sb.name === 'Default Sidebar') || null;
    this.activeSidebar = this.defaultSidebar;
    if (this.defaultSidebar) {
      this.defaultSidebar.isDisplayed = true;
    }
  }

  addSidebar(): void {
    if (!this.selectedItem) {
        alert('Please select an item to associate with the new sidebar.');
        return;
    }

    const newSidebar: Sidebar = {
        id: 0,
        name: 'New Sidebar',
        style: 'default-style',
        position_x: 0,
        position_y: 0,
        width: 300,
        height: 300,
        toggles: {
            enableAddParent: true,
            enableAddChild: true,
            enableEdit: true,
            enableDelete: true,
            enableReorder: true,
            enableMoveToParent: true,
            enableMoveSidebar: true,
            enableResizeSidebar: false
        },
        isDisplayed: false
    };

    this.sidebarService.addSidebar(newSidebar).subscribe(sidebar => {
        this.selectedItem!.linked_sidebar = sidebar;

        const updateItem: any = {
            id: this.selectedItem!.id,
            title: this.selectedItem!.title,
            url: this.selectedItem!.url,
            parent: this.selectedItem!.parent,
            order: this.selectedItem!.order,
            sidebar: this.selectedItem!.sidebar,
            linked_sidebar: sidebar.id
        };

        this.sidebarService.updateSidebarItem(this.selectedItem!.id, updateItem).subscribe(() => {
            this.sidebars.push(sidebar);
            this.displaySidebar(sidebar);
            this.selectedItem = null;
            this.cdr.detectChanges();
        }, error => {
            console.error('Error updating sidebar item:', error);
        });
    }, error => {
        console.error('Error adding sidebar:', error);
    });
  }

  deleteSidebar(sidebar: Sidebar): void {
    if (sidebar === this.defaultSidebar) {
      alert("You cannot delete the default sidebar.");
      return;
    }
    this.sidebarService.deleteSidebar(sidebar.id).subscribe(() => {
      this.sidebars = this.sidebars.filter(s => s.id !== sidebar.id);
      this.cdr.detectChanges();
    }, error => {
      console.error('Error deleting sidebar:', error);
    });
  }

  onItemSelect(item: SidebarItem): void {
    this.selectedItem = item;
    const displayedSidebars: Sidebar[] = [];

    if (item.linked_sidebar) {
      // Si l'élément a un sidebar lié, l'afficher
      this.displaySidebarRecursively(item, displayedSidebars);
    } else {
      // Si l'élément n'a pas de sidebar lié, conserver les sidebars existantes
      displayedSidebars.push(...this.sidebars.filter(sb => sb.isDisplayed));
    }

    // Mettre à jour les sidebars affichées
    this.sidebars.forEach(sb => {
        if (!displayedSidebars.includes(sb) && sb !== this.defaultSidebar) {
            sb.isDisplayed = false;
        } else if (displayedSidebars.includes(sb)) {
            sb.isDisplayed = true;
        }
    });

    this.cdr.detectChanges();
  }

  displaySidebarRecursively(item: SidebarItem, displayedSidebars: Sidebar[]): void {
    if (!item) return;

    const linkedSidebarId = item.linked_sidebar;
    if (linkedSidebarId !== null && typeof linkedSidebarId === 'number') {
        const linkedSidebar = this.sidebars.find(sb => sb.id === linkedSidebarId);
        if (linkedSidebar && !displayedSidebars.includes(linkedSidebar)) {
            linkedSidebar.isDisplayed = true;
            displayedSidebars.push(linkedSidebar);
        }
    }

    const parentItem = this.findParentItem(item);
    if (parentItem) {
        this.displaySidebarRecursively(parentItem, displayedSidebars);
    }
  }

  findParentItem(item: SidebarItem): SidebarItem | null {
    for (const sidebar of this.sidebars) {
        const parentItem = (sidebar as any).items?.find((parent: SidebarItem) => parent.id === item.parent) || null;
        if (parentItem) {
            return parentItem;
        }
    }
    return null;
  }

  displaySidebar(sidebar: Sidebar | null): void {
    if (this.defaultSidebar) {
        this.defaultSidebar.isDisplayed = true;
    }

    if (sidebar && sidebar !== this.defaultSidebar) {
        sidebar.isDisplayed = true;
        this.activeSidebar = sidebar;
    }

    this.cdr.detectChanges();
  }
}
