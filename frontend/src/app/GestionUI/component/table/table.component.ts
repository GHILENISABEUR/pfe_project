import { Component, ViewChild, Input, SimpleChanges, ChangeDetectorRef, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { TableService } from 'src/app/services/table.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { ResizeEvent } from 'angular-resizable-element';
import { saveAs } from 'file-saver';
import { S_VisualService } from 'src/app/GestionDB/services/visualService/visual.service';
import { S_CategoryService } from 'src/app/GestionDB/services/categService/Category.service';
import { S_TableService } from 'src/app/GestionDB/services/TableService/Table.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('tableContainer') tableContainer!: ElementRef;

  @Input() table: any;
  @Input() isUserMode: boolean = false;
  displayedColumns: string[] = [];
  allColumns: string[] = ['select'];
  dataSource: MatTableDataSource<any>;
  private tableUpdateSubscription!: Subscription;
  editingCell: { rowIndex: number, column: string } | null = null;
  editingHeader: string | null = null;
  private selectedColumnElements: HTMLElement[] = [];

  isRowDragEnabled: boolean = true; // Pour activer ou désactiver le drag and drop des lignes
  isColumnDragEnabled: boolean = true;
  isDragEnabled: boolean = true;
  private resizing: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private resizeDirection: string = '';
  isSelected: boolean = false;
  isSelecting: boolean = false;
  startCell: { rowIndex: number, column: string } | null = null;
  startColumn: string = "";
  startRow: number = 0;

  paginationEnabled: boolean = false;
  filteringEnabled: boolean = false;
  position?: { x: number, y: number };
  showAddRowButton?: boolean;
  showAddColumnButton?: boolean;
  showPaginationToggle?: boolean;
  showFilteringToggle?: boolean;
  showImportExcel?: boolean;
  showSelect?:boolean;
  showExportExcel?:boolean
  isStyleConfig: boolean = false;
  isFunctionalityConfig: boolean = false;
  public style: object = {};
  visuals: any[] = [];
  constructor(public tableService: TableService,public visualService:S_VisualService,public S_TableService:S_TableService,public S_CategoryService:S_CategoryService,private cdr: ChangeDetectorRef, private renderer: Renderer2, private el: ElementRef) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngAfterViewInit() {
    this.visualService.S_getVisualsByWebsiteId(this.table.webSite).subscribe(data => {
      this.visuals = data;
    });


    this.onClick();
    this.updateTableData();
    this.tableUpdateSubscription = this.tableService.tableUpdated.subscribe((tableId: number) => {
      if (this.table && this.table.id === tableId) {
        this.updateTableData();
      }

    });

    this.tableService.unselectedTable();
    this.TS_loadCategories();

    document.addEventListener('click', this.onDocumentClick.bind(this));


  }
  selectedVisualData: any[] = [];

  onVisualChange(visual: any): void {
    console.log('visual',visual)




 // Accessing the data array directly
 this.selectedVisualData = visual.data;
 console.log("this.selectedVisualData", this.selectedVisualData);


  const newColumns = Object.keys(this.selectedVisualData[0]);


 // Transform rows to be the values of each object
 const newRows = this.selectedVisualData;
console.log("newRows",newRows)
 // Manually trigger change detection to update the table
 this.cdr.detectChanges();










    this.tableService.updateTableColumns(this.table, newColumns);



    this.tableService.updateTableRows(this.table, newRows);
    this.cdr.detectChanges();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['table']) {
      this.updateTableData();
    }
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
    if (this.tableUpdateSubscription) {
      this.tableUpdateSubscription.unsubscribe();
    }
  }

  drop(event: CdkDragDrop<string>) {
    const previousIndex = this.dataSource.data.findIndex(d => d === event.item.data);
    moveItemInArray(this.dataSource.data, previousIndex, event.currentIndex);
    this.dataSource.data = [...this.dataSource.data];
    this.tableService.updateTableRows(this.tableService.selectedTable!, this.dataSource.data);
    this.updateTableData();
  }

  updateTableData() {
    if (!this.tableService.selectedTable || !this.table || this.tableService.selectedTable.id !== this.table.id) {
      return;
    }

    this.displayedColumns = [...this.table.cols];
    this.allColumns = ['select', ...this.displayedColumns];
    this.dataSource.data = [...this.table.rows];

    this.paginationEnabled = this.table.paginationEnabled;
    this.filteringEnabled = this.table.filteringEnabled;
    this.position = this.table.position;
    this.showAddRowButton = this.table.showAddRowButton;
    this.isRowDragEnabled = this.table.isRowDragEnabled;
    this.isColumnDragEnabled = this.table.isColumnDragEnabled;
    this.isDragEnabled = this.table.isDragEnabled;
    this.showAddColumnButton = this.table.showAddColumnButton;
    this.showPaginationToggle = this.table.showPaginationToggle;
    this.showFilteringToggle = this.table.showFilteringToggle;
    this.showImportExcel = this.table.showImportExcel;
    this.showSelect=this.table.showSelect;
    this.showExportExcel=this.table.showExportExcel;


    if (this.paginationEnabled) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.filteringEnabled) {
      this.dataSource.sort = this.sort;
    }

    this.cdr.detectChanges();
  }

  onClick() {
    this.tableService.selectTable(this.table);
    this.tableService.isTableSelected=true;
    this.isSelected = true;
  }
  onCharge() {
    this.tableService.selectTable(this.table);
    this.tableService.isTableSelected=true;

  }
  applyColumnFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data, filter) => {
      const dataStr = data[column].toString().toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addColumn() {
    const newColumnName = `column_${this.displayedColumns.length + 1}`;
    this.tableService.addColumn(this.table, newColumnName);
    this.updateTableData();
  }
isRowAdd=false;
  addRow() {
    this.tableService.addRow(this.table);
    this.updateTableData();
     this.isRowAdd=true;
  }

  removeRow(rowIndex: number) {
    this.tableService.removeRow(this.table, rowIndex);
    this.updateTableData();
  }
  isModifierRow
  modifyRow(index: number): void {
    console.log('Modify row at index:', index);
    // Implement the logic to modify the row
  }

  validateRow(index: number): void {
    console.log('Validate row at index:', index);
    // Implement the logic to validate the row
  }

  removeColumn(columnName: string) {
    this.tableService.removeColumn(this.table, columnName);
    this.updateTableData();
  }

  onColumnNameChange(event: Event, oldName: string) {
    const inputElement = event.target as HTMLInputElement;
    const newName = inputElement.value;
    this.renameColumn(oldName, newName);
    this.editingHeader = null;
  }

  renameColumn(oldName: string, newName: string) {
    if (this.tableService.selectedTable && this.tableService.selectedTable.id === this.table.id) {
      const index = this.displayedColumns.indexOf(oldName);
      console.log("index",index)
      if (index !== -1) {
        this.displayedColumns[index] = newName;
        this.tableService.selectedTable.cols[index] = newName;
        this.table.rows.forEach(row => {
          row[newName] = row[oldName];
          delete row[oldName];
        });
        this.tableService.updateTable(this.table).subscribe(() => {
          console.log('Table configuration updated successfully');
        });        this.tableService.tableUpdated.emit(this.table.id);
        this.updateTableData();
      }
    }
  }

  startEditCell(rowIndex: number, column: string) {
    if (this.tableService.selectedTable && this.tableService.selectedTable.id === this.table.id &&this.table.toggle.EditerEnable==true) {
      this.editingCell = { rowIndex, column };
    }
  }

  saveCell(rowIndex: number, column: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.tableService.selectedTable && this.tableService.selectedTable.id === this.table.id) {
      this.tableService.selectedTable.rows[rowIndex][column] = inputElement.value;
      this.editingCell = null;
      this.tableService.updateTable(this.table).subscribe(() => {
        console.log('Table configuration updated successfully');
      });
      this.tableService.tableUpdated.emit(this.table.id);

    }
  }

  startEditHeader(column: string) {
    if (this.tableService.selectedTable && this.tableService.selectedTable.id === this.table.id &&this.table.toggle.EditerEnable==true) {
      this.editingHeader = column;
    }
  }
  filterVisible: { [key: string]: boolean } = {};


  toggleFilterInput(column: string) {
    this.filterVisible[column] = !this.filterVisible[column];
  }
  selectRow(rowIndex: number) {
    this.tableService.selectRow(rowIndex);
  }

  selectColumn(column: string) {
    this.tableService.selectColumn(column);

    if (this.selectedColumnElements.length > 0) {
      this.selectedColumnElements.forEach(element => this.renderer.removeClass(element, 'selected-column'));
    }

    const columnHeader = this.el.nativeElement.querySelector(`th[data-column-id="${column}"]`);
    const columnCells = this.el.nativeElement.querySelectorAll(`td[data-column-id="${column}"]`);
    this.selectedColumnElements = [columnHeader, ...Array.from(columnCells)];

    this.selectedColumnElements.forEach(element => this.renderer.addClass(element, 'selected-column'));
  }

  startCellSelection(event: MouseEvent, rowIndex: number, column: string) {
    this.isSelecting = true;
    this.startCell = { rowIndex, column };
    this.tableService.clearSelectedCells();
    this.tableService.selectCell(rowIndex, column);
    this.highlightSelectedCells();
  }

  mouseMoveCellSelection(event: MouseEvent, rowIndex: number, column: string) {
    if (this.isSelecting && this.startCell) {
      this.tableService.clearSelectedCells();
      const startRowIndex = Math.min(this.startCell.rowIndex, rowIndex);
      const endRowIndex = Math.max(this.startCell.rowIndex, rowIndex);
      const startColumnIndex = Math.min(this.displayedColumns.indexOf(this.startCell.column), this.displayedColumns.indexOf(column));
      const endColumnIndex = Math.max(this.displayedColumns.indexOf(this.startCell.column), this.displayedColumns.indexOf(column));

      for (let i = startRowIndex; i <= endRowIndex; i++) {
        for (let j = startColumnIndex; j <= endColumnIndex; j++) {
          this.tableService.selectCell(i, this.displayedColumns[j]);
        }
      }
      this.highlightSelectedCells();
    }
  }

  endCellSelection() {
    this.isSelecting = false;
    this.startCell = null;
  }

  highlightSelectedCells() {
    // Assurez-vous que le tableau est sélectionné
    if (!this.table) {
      return;
    }

    // Sélectionner uniquement les cellules (td) et les en-têtes (th) dans le tableau en cours
    const tableElement = this.el.nativeElement.querySelector(`#table-${this.table.id}`);
    console.log("tableElement",tableElement)
    if (!tableElement) {
      return;
    }

    // Désélectionner toutes les cellules précédemment sélectionnées
    const cells = tableElement.querySelectorAll('td, th');
    cells.forEach((cell: HTMLElement) => this.renderer.removeClass(cell, 'selected-cell'));

    // Ajouter la classe 'selected-cell' aux cellules sélectionnées
    this.tableService.selectedCells.forEach(cell => {
      const cellElement = tableElement.querySelector(`td[data-row-index="${cell.rowIndex}"][data-column-id="${cell.column}"], th[data-row-index="${-2}"][data-column-id="${cell.column}"]`);
      console.log("cellElement",cellElement)
      if (cellElement) {
        this.renderer.addClass(cellElement, 'selected-cell');
      }
    });
  }


  startColumnSelection(column: string) {
    this.isSelecting = true;
    this.startColumn = column;
    this.tableService.clearSelectedCells();
    this.selectEntireColumn(column);
    this.highlightSelectedCells();
  }

  endColumnSelection() {
    this.isSelecting = false;
    this.startColumn = "";
  }

  startRowSelection(row: number) {
    this.isSelecting = true;
    this.startRow = row;
    this.tableService.clearSelectedCells();
    this.selectEntireRow(row);
    this.highlightSelectedCells();
  }

  endRowSelection() {
    this.isSelecting = false;
    this.startRow = 0;
  }

  selectEntireRow(row: number) {
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.tableService.selectCell(row, this.displayedColumns[i]);
    }
  }

  selectEntireColumn(column: string) {
    this.tableService.selectCell(-2, column);
    for (let i = 0; i < this.dataSource.data.length; i++) {
      this.tableService.selectCell(i, column);
    }
  }

  isCellSelected(rowIndex: number, column: string): boolean {
    return this.tableService.selectedCells.some(cell => cell.rowIndex === rowIndex && cell.column === column);
  }

  onDocumentClick(event: Event) {
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (!clickedInside && this.isSelected) {
      this.isSelected = false;
    }
    const clickedInsideColumn = this.selectedColumnElements.some(element => element.contains(event.target as Node));
    if (!clickedInsideColumn && this.selectedColumnElements.length > 0) {
      this.selectedColumnElements.forEach(element => this.renderer.removeClass(element, 'selected-column'));
      this.selectedColumnElements = [];
    }

    if (!clickedInside && this.isSelected) {
      this.isSelected = false;
      this.tableService.clearSelectedCells();
      this.highlightSelectedCells();
    }
    if (!clickedInside && this.filterVisible) {
      this.filterVisible={}

    }

  }





  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 50;
    if (
      event.rectangle.width &&
      event.rectangle.height &&
      (event.rectangle.width < MIN_DIMENSIONS_PX ||
        event.rectangle.height < MIN_DIMENSIONS_PX)
    ) {
      return false;
    }
    return true;
  }
  public tableStyle: any = {};

  onResizeEnd(event: ResizeEvent): void {
    this.onClick();
    const newStyle = { ...this.table.tableStyle };

    if (event.edges.right !== undefined) {
      newStyle.width = `${event.rectangle.width}px`;
    }
    if (event.edges.bottom !== undefined) {
      newStyle.height = `${event.rectangle.height}px`;
    }
    if (event.edges.left !== undefined) {
      newStyle.left = `${event.rectangle.left}px`;
      newStyle.width = `${event.rectangle.width}px`;
    }
    if (event.edges.top !== undefined) {
      newStyle.top = `${event.rectangle.top}px`;
      newStyle.height = `${event.rectangle.height}px`;
    }

    this.table.tableStyle = newStyle;
    this.tableService.changeStyleTbale(this.table,newStyle)
    console.log("  this.tableStyle",  this.tableStyle)
  }



  dropRow(event: CdkDragDrop<any[]>) {
    const previousIndex = this.dataSource.data.findIndex(d => d === event.item.data);
    moveItemInArray(this.dataSource.data, previousIndex, event.currentIndex);
    this.dataSource.data = [...this.dataSource.data];
    this.tableService.updateTableRows(this.tableService.selectedTable!, this.dataSource.data);
  }

  dropColumn(event: CdkDragDrop<string[]>) {
    const previousIndex = this.displayedColumns.findIndex(d => d === event.item.data);
    moveItemInArray(this.displayedColumns, previousIndex, event.currentIndex);
    this.displayedColumns = [...this.displayedColumns];
    this.allColumns = ['select', ...this.displayedColumns];
    this.tableService.updateTableColumns(this.tableService.selectedTable!, this.displayedColumns);
  }

  togglePagination() {
    this.paginationEnabled = !this.paginationEnabled;
    if (this.paginationEnabled) {
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.paginator = null;
    }
    this.updateTableConfig();
  }

  toggleFiltering() {
    this.filteringEnabled = !this.filteringEnabled;
    if (!this.filteringEnabled) {
      this.dataSource.filter = '';
      this.dataSource.sort = null;
    } else {
      this.dataSource.sort = this.sort;
    }
    this.updateTableConfig();
  }

  updateTableConfig() {
    if (this.table) {
      this.table.paginationEnabled = this.paginationEnabled;
      this.table.filteringEnabled = this.filteringEnabled;
      this.tableService.updateTable(this.table).subscribe(() => {
        console.log('Table configuration updated successfully');
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  @ViewChild('fileInput', { static: false }) fileInput: any;


  onFileChange(event: any) {
    console.log("File change event:", event);

    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    this.resetTable();

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      console.log("File loaded:", e);

      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      console.log("Excel data:", data);
      this.fileInput.nativeElement.value = ''; // Réinitialiser l'élément input

      this.updateTableFromExcelData(data);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  updateTableFromExcelData(data: any[]) {
    if (data.length === 0) return;

    const newColumns = data[0];
    console.log("New columns:", newColumns);

    this.tableService.updateTableColumns(this.table, newColumns);

    const newRows = data.slice(1).map((row: any[]) => {
      const rowData: any = {};
      newColumns.forEach((col: string, index: number) => {
        rowData[col] = row[index];
      });
      return rowData;
    });
    console.log("New rows:", newRows);

    this.tableService.updateTableRows(this.table, newRows);
    this.cdr.detectChanges();

  }
  resetTable() {
    this.table.columns = [];
    this.table.rows = [];
    // Si vous avez un dataSource, réinitialisez-le aussi
    this.dataSource.data = [];
  }

  removeTable() {
    if (this.table && confirm('Are you sure you want to delete this table?')) {
      this.tableService.deleteTable(this.table.id!).subscribe(() => {
        this.table = null;
        this.tableService.selectedTable = null;
        this.dataSource.data = [];
        this.displayedColumns = [];
        this.allColumns = ['select'];
        this.cdr.detectChanges();
      });
    }
  }

  dragStarted(event: any) {
    this.onClick();
    this.renderer.addClass(this.tableContainer.nativeElement, 'dragging');
  }

  dragEnded(event: CdkDragEnd) {
    const { x, y } = event.source.getFreeDragPosition();
    this.table.position = { x, y };
    this.position = { x, y };
    this.tableService.updateTablePosition(this.table, x, y);
  }

  showStyleConfig() {
    this.tableService.showStyleConfig(this.table);
  }

  showFunctionalityConfig() {
    this.tableService.showFunctionalityConfig(this.table);
  }
  exportToExcel() {
    console.log('Starting exportToExcel function');

    try {
      // Create a worksheet from the data
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
      console.log('Worksheet created:', ws);

      // Create a workbook and add the worksheet
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      console.log('Workbook created and worksheet appended:', wb);

      // Generate an Excel file (blob)
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      console.log('Workbook output generated:', wbout);

      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      console.log('Blob created:', blob);

      // Use FileSaver to save the file
      saveAs(blob, 'tableau.xlsx');
      console.log('SaveAs function called');
    } catch (error) {
      console.error('Error during export to Excel:', error);
    }
  }
  showTable:boolean=false;
  onCategoryChange(categoryId: number): void {

    this.showTable=true;
    this.TS_LoadTablesByCategory(categoryId);
  }
  categories:any;
  TS_loadCategories(): void {
    this.S_CategoryService.getCategoriesByWebsiteId(this.table.webSite).subscribe(categories => {
      this.categories = categories.sort((a, b) => {
        if (a.name === 'Non Classified') return -1;
        if (b.name === 'Non Classified') return 1;
        return a.name.localeCompare(b.name);
      });
      console.log(" this.categories", this.categories)

    });

  }
  tables:any;
  TS_LoadTablesByCategory(categoryId: number): void {
    this.S_TableService.S_getTablesByCategoryId(categoryId).subscribe(tables => {
        this.tables = tables.map(table => {
            return {
                ...table,
                name: table.name.replace(`_${this.table.webSite}`, '') // Retirer l'ID du site Web
            };
        });
        console.log("this.tables",this.tables)

    });
}
integartionBD:boolean=false;
onTableChange(tableId: number): void {
  this.TS_loadData(tableId);
  this.integartionBD=true;
}
integrateWithDatabase() {
  Swal.fire({
    title: 'Attention',
    text: 'Toute modification, ajout ou suppression sera intégrée avec la base de données.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Confirmer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      // Ajoutez ici la logique pour l'intégration avec la base de données
this.table.disableld=true;
this.table.toggle.showAddColumnButton=false;
this.table.toggle.showImportExcel=false;

this.table.toggle.showSelect=false;

this.table.toggle.isColumnDragEnabled=false;



}
  });
}
TS_loadData(tableId: number): void {
  if (tableId) {
    this.S_TableService.S_getDataByTable(tableId).subscribe(data => {
      if (data && data.length > 0) {
        // Extraire les clés des 'details' comme colonnes
        const newColumns = Object.keys(data[0].details);

        // Construire les lignes de données
       const  newRows = data.map(item => item.details);

        // Mettre à jour l'affichage
        this.cdr.detectChanges();

        console.log("this.displayedColumns:", this.displayedColumns);
        console.log("this.dataSource.data:", this.dataSource.data);









        // Transform rows to be the values of each object
       console.log("newRows",newRows)
        // Manually trigger change detection to update the table
        this.cdr.detectChanges();










           this.tableService.updateTableColumns(this.table, newColumns);



           this.tableService.updateTableRows(this.table, newRows);
           this.cdr.detectChanges();





      }
    });
  }
}

}
