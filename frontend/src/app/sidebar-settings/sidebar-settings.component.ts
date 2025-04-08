import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar-settings',
  templateUrl: './sidebar-settings.component.html',
  styleUrls: ['./sidebar-settings.component.css']
})
export class SidebarSettingsComponent {
  @Input() enableAddParent!: boolean;
  @Input() enableAddChild!: boolean;
  @Input() enableEdit!: boolean;
  @Input() enableDelete!: boolean;
  @Input() enableReorder!: boolean;
  @Input() enableMoveToParent!: boolean;
  @Input() enableMoveSidebar!: boolean;
  @Input() enableResizeSidebar!: boolean;
  @Input() isStyleMenuVisible!: boolean;
  @Input() currentTheme!: string;

  @Output() enableAddParentChange = new EventEmitter<boolean>();
  @Output() enableAddChildChange = new EventEmitter<boolean>();
  @Output() enableEditChange = new EventEmitter<boolean>();
  @Output() enableDeleteChange = new EventEmitter<boolean>();
  @Output() enableReorderChange = new EventEmitter<boolean>();
  @Output() enableMoveToParentChange = new EventEmitter<boolean>();
  @Output() enableMoveSidebarChange = new EventEmitter<boolean>();
  @Output() enableResizeSidebarChange = new EventEmitter<boolean>();
  @Output() isStyleMenuVisibleChange = new EventEmitter<boolean>();
  @Output() currentThemeChange = new EventEmitter<string>();

  showStyleMenu(): void {
    this.isStyleMenuVisible = true;
    this.isStyleMenuVisibleChange.emit(this.isStyleMenuVisible);
  }

  showToggleMenu(): void {
    this.isStyleMenuVisible = false;
    this.isStyleMenuVisibleChange.emit(this.isStyleMenuVisible);
  }

  applyTheme(theme: string): void {
    this.currentTheme = theme;
    this.currentThemeChange.emit(this.currentTheme);
  }

  toggleEnableAddParent(): void {
    this.enableAddParent = !this.enableAddParent;
    this.enableAddParentChange.emit(this.enableAddParent);
  }

  toggleEnableAddChild(): void {
    this.enableAddChild = !this.enableAddChild;
    this.enableAddChildChange.emit(this.enableAddChild);
  }

  toggleEnableEdit(): void {
    this.enableEdit = !this.enableEdit;
    this.enableEditChange.emit(this.enableEdit);
  }

  toggleEnableDelete(): void {
    this.enableDelete = !this.enableDelete;
    this.enableDeleteChange.emit(this.enableDelete);
  }

  toggleEnableReorder(): void {
    this.enableReorder = !this.enableReorder;
    this.enableReorderChange.emit(this.enableReorder);
  }

  toggleEnableMoveToParent(): void {
    this.enableMoveToParent = !this.enableMoveToParent;
    this.enableMoveToParentChange.emit(this.enableMoveToParent);
  }

  toggleEnableMoveSidebar(): void {
    this.enableMoveSidebar = !this.enableMoveSidebar;
    this.enableMoveSidebarChange.emit(this.enableMoveSidebar);
  }

  toggleEnableResizeSidebar(): void {
    this.enableResizeSidebar = !this.enableResizeSidebar;
    this.enableResizeSidebarChange.emit(this.enableResizeSidebar);
  }
}
