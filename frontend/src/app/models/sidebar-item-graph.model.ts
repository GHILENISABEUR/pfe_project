export interface Sidebar {
  id: number;
  name: string;
  style: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  toggles: {
    enableAddParent: boolean;
    enableAddChild: boolean;
    enableEdit: boolean;
    enableDelete: boolean;
    enableReorder: boolean;
    enableMoveToParent: boolean;
    enableMoveSidebar: boolean;
    enableResizeSidebar: boolean;
  };
  isDisplayed?: boolean;  
}

export interface SidebarItem {
  id: number;
  title: string;
  url: string;
  parent: number | SidebarItem | null;
  order: string;
  children: SidebarItem[];
  sidebar: number | Sidebar | null;
  linked_sidebar: Sidebar | null;  
  isEditing: boolean;
  isExpanded: boolean;
  isSelected?: boolean; // Add this property to track selection
  websiteId: number | null;  // Add this property to represent website association

}
