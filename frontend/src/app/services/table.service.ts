import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
interface Table {
  id?: number;
  rows: any[];
  cols: string[];

  tableStyle?: { [key: string]: any };

  backgroundColor?: string;

  cellStyles?: { [key: string]: any };
  position?: { x: number, y: number };
  paginationEnabled?: boolean;  // Ajout du champ paginationEnabled
  filteringEnabled?: boolean;
  showAddRowButton?: boolean ;
  showAddColumnButton?: boolean ;
  showPaginationToggle?: boolean ;
  showFilteringToggle?: boolean ;
  isEditerEnable?: boolean ;

  showImportExcel?: boolean;
  showSelect?:boolean;
  showExportExcel?:boolean;
  isRowDragEnabled?:boolean; // Pour activer ou désactiver le drag and drop des lignes
    isColumnDragEnabled?:boolean;
    isDragEnabled?:boolean;
    borderVisible?: boolean;
    cellBorderVisible?: boolean;
    isTableSelected?: boolean ;
    webSite:number;
    showCategories?:boolean;
    isStyleConfig?: boolean ;
  isFunctionalityConfig?: boolean ;
  toggle: {
    showAddRowButton: boolean;
    showAddColumnButton: boolean;
    showPaginationToggle: boolean;
    showFilteringToggle: boolean;
    showImportExcel: boolean;
    showSelect: boolean;
    isRowDragEnabled: boolean;
    isColumnDragEnabled: boolean;
    isDragEnabled: boolean;
    EditerEnable: boolean;
    showExportExcel: boolean;
    showCategories:boolean;
  };
  disableld?:false;

}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = 'http://127.0.0.1:8000/clev/table/'; // Change to your API URL

  tables: Table[] = [];
  selectedTable: Table | null = null;
  selectedRowIndex: number | null = null;
  selectedColumn: string | null = null;
  tableUpdated: EventEmitter<number> = new EventEmitter<number>();



  selectedCells: { rowIndex: number, column: string }[] = [];
  isStyleConfig: boolean = false;
  isFunctionalityConfig: boolean = false;

isTableSelected:boolean=false;


  showAddRowButton?: boolean ;
  showAddColumnButton?: boolean ;
  showPaginationToggle?: boolean ;
  showFilteringToggle?: boolean ;
  showImportExcel?:boolean;
  showExportExcel?:boolean;
  showSelect?:boolean;
  showCategories?:boolean;


  isRowDragEnabled?:boolean; // Pour activer ou désactiver le drag and drop des lignes
    isColumnDragEnabled?:boolean;
    isDragEnabled?:boolean;
    isEditerEnable?:boolean;
  constructor(private http: HttpClient) { }
  getAllTables(websiteId: number): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.apiUrl}?websiteId=${websiteId}`).pipe(
      map(tables => {
        console.log("tables",tables)
        return tables;
      })
    );
  }


  createTable(table: Table): Observable<Table> {
    return this.http.post<Table>(`${this.apiUrl}create`, table).pipe(
      map(newTable => {
        this.tables.push(newTable);
        return newTable;
      })
    );
  }

  updateTable(table: Table): Observable<any> {
    return this.http.put<Table>(`${this.apiUrl}update/${table.id}`,table).pipe(
      map(() => {
        //  this.tables = this.tables.filter(t => t.id !== table.id);
      })
    );
  }
  getTableById(id:number):Observable<any> {
    return this.http.delete(`${this.apiUrl}delete/${id}`).pipe(
      map(() => {
        this.tables = this.tables.filter(t => t.id !== id);
      })
    );
  }
  deleteTable(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete/${id}`).pipe(
      map(() => {
        this.tables = this.tables.filter(t => t.id !== id);
      })
    );
  }


  addTable(webSiteId:number) {
    const newTable: Table = {

      rows: [{column_1:"",column_2:"",column_3:""},{column_1:"",column_2:"",column_3:""},{column_1:"",column_2:"",column_3:""}],
      cols: ["column_1","column_2","column_3"],
      webSite: webSiteId,
      toggle: {
        showAddRowButton: false,
        showAddColumnButton: false,
        showPaginationToggle: false,
        showFilteringToggle: false,
        showImportExcel: false,
        showSelect: false,
        isRowDragEnabled: false,
        isColumnDragEnabled: false,
        isDragEnabled: true,
        EditerEnable: false,
        showExportExcel: false,
        showCategories:false,
      }


    };
    // this.tables.push(newTable);
    this.createTable(newTable).subscribe();
    console.log("Table added:", newTable);
  }
unselectedTable(){
  this.selectedTable=null;
}
  selectTable(table: Table|null) {
    if (this.selectedTable && this.selectedTable.id === table!.id) {
      return; // Ne rien faire si le tableau est déjà sélectionné
    }
    this.selectedTable = table;
    table!.isTableSelected=false;
    this.selectedTable!.showAddRowButton= table!.showAddRowButton;
    this.selectedTable!.showAddColumnButton = table!.showAddColumnButton;
    this.selectedTable!.showPaginationToggle = table!.showPaginationToggle;
    this.selectedTable!.showFilteringToggle = table!.showFilteringToggle;
    this.selectedTable!.showImportExcel=table!.showImportExcel;
    this.selectedTable!.showSelect=table!.showSelect;
    this.selectedTable!.showExportExcel=table!.showExportExcel;
    this.selectedTable!.showCategories=table!.showCategories;
    this.selectedTable!.isColumnDragEnabled=table!.isColumnDragEnabled;
    this.selectedTable!.isRowDragEnabled=table!.isRowDragEnabled;
    this.selectedTable!.isDragEnabled=table!.isDragEnabled;
    this.selectedTable!.isEditerEnable=table!.isEditerEnable
    this.isFunctionalityConfig=false;
    this.isStyleConfig=false;
    this.isColumnDragEnabled=table!.isColumnDragEnabled;
    this.isRowDragEnabled=table!.isRowDragEnabled;
    this.isDragEnabled=table!.isDragEnabled;
    this.isEditerEnable=table!.isEditerEnable

this.showImportExcel= table!.showImportExcel;
this.showExportExcel=table!.showExportExcel;
this.showSelect=table!.showSelect;
    this.showAddRowButton= table!.showAddRowButton;
    this.showAddColumnButton=table!.showAddColumnButton ;
    this.showPaginationToggle=table!.showPaginationToggle;
    this.showFilteringToggle=table!.showFilteringToggle ;


    this.selectedRowIndex = null;
    this.selectedColumn = null;
    this.selectedCells = [];
    this.tableUpdated.emit(table!.id);
    console.log("Table selected:", this.selectedTable);
  }

  addRow(table: Table) {
    const newRow: any = {};
    table.cols.forEach(col => newRow[col] = '');
    table.rows.push(newRow);
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();
    console.log("Row added:", newRow);
    console.log("Updated table rows:", table.rows);
  }

  addColumn(table: Table, columnName: string) {
    table.cols.push(columnName);
    table.rows.forEach(row => row[columnName] = '');
    this.tableUpdated.emit(table.id);
    console.log("Column added:", columnName);
    console.log("Updated table columns:", table.cols);
    console.log("Updated table rows after adding column:", table.rows);
    this.updateTable(table).subscribe();

  }

  removeRow(table: Table, rowIndex: number) {
    if (rowIndex >= 0 && rowIndex < table.rows.length) {
      table.rows.splice(rowIndex, 1);
      this.tableUpdated.emit(table.id);
      console.log("Row removed:", rowIndex);
      console.log("Updated table rows:", table.rows);
      this.updateTable(table).subscribe();

    }
  }

  removeColumn(table: Table, columnName: string) {
    const colIndex = table.cols.indexOf(columnName);
    if (colIndex !== -1) {
      table.cols.splice(colIndex, 1);
      table.rows.forEach(row => delete row[columnName]);
      this.tableUpdated.emit(table.id);
      console.log("Column removed:", columnName);
      console.log("Updated table columns:", table.cols);
      console.log("Updated table rows after removing column:", table.rows);
      this.updateTable(table).subscribe();

    }
  }

  selectRow(rowIndex: number) {
    this.selectedRowIndex = rowIndex;
  }

  selectColumn(column: string) {
    this.selectedColumn = column;
  }


  changeTableBackground(table: Table, color: string) {
    table.backgroundColor = color;
    console.log("background",table.backgroundColor);
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();

  }
  changeStyleTbale(table:Table,style:JSON){
    table.tableStyle=style;
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();
  }
  changeCellBackground(table: Table, color: string) {
    if (!table.cellStyles) {
      table.cellStyles = {};
    }
    this.selectedCells.forEach(cell => {
      if (!table.cellStyles![cell.rowIndex]) {
        table.cellStyles![cell.rowIndex] = {};
      }
      if (!table.cellStyles![cell.rowIndex][cell.column]) {
        table.cellStyles![cell.rowIndex][cell.column] = {};
      }
      table.cellStyles![cell.rowIndex][cell.column].backgroundColor = color;
    });
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();

  }



  changeTextColor(table: Table, color: string) {
    if (!table.cellStyles) {
      table.cellStyles = {};
    }
    this.selectedCells.forEach(cell => {
      if (!table.cellStyles![cell.rowIndex]) {
        table.cellStyles![cell.rowIndex] = {};
      }
      if (!table.cellStyles![cell.rowIndex][cell.column]) {
        table.cellStyles![cell.rowIndex][cell.column] = {};
      }
      table.cellStyles![cell.rowIndex][cell.column].textColor = color;
    });
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();

  }

  changeCellFont(table: Table, font: string) {
    if (!table.cellStyles) {
      table.cellStyles = {};
    }
    this.selectedCells.forEach(cell => {
      if (!table.cellStyles![cell.rowIndex]) {
        table.cellStyles![cell.rowIndex] = {};
      }
      if (!table.cellStyles!![cell.rowIndex][cell.column]) {
        table.cellStyles![cell.rowIndex][cell.column] = {};
      }
      table.cellStyles![cell.rowIndex][cell.column].font = font;
    });
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();

  }



   selectCell(rowIndex: number, column: string) {
    const cell = { rowIndex, column };
    const cellIndex = this.selectedCells.findIndex(c => c.rowIndex === rowIndex && c.column === column);
    if (cellIndex === -1) {
      this.selectedCells.push(cell);
    } else {
      this.selectedCells.splice(cellIndex, 1);
    }
  }

  clearSelectedCells() {
    this.selectedCells = [];
  }
  updateTableRows(table: Table, rows: any[]) {
    table.rows = rows;
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();

  }

  updateTableColumns(table: Table, cols: string[]) {
    table.cols = cols;
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();

  }
   updateTablePosition(table: Table, x: number, y: number) {

      table.position = { x, y };

    this.updateTable(table).subscribe(() => {
      console.log('Table position updated successfully');
    });
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();
  }

  showStyleConfig(table:Table) {
    table.isStyleConfig = true;
    this.isStyleConfig=table.isStyleConfig
    table.isFunctionalityConfig = false;
    this.isFunctionalityConfig=table.isFunctionalityConfig ;
  }

  showFunctionalityConfig(table:Table) {
    table.isStyleConfig = false;
    this.isStyleConfig=table.isStyleConfig

    table.isFunctionalityConfig = true;
    this.isFunctionalityConfig=table.isFunctionalityConfig ;

  }
  toggleButton(feature: string, table: Table) {
    if (!table.toggle) {
      table.toggle = {
        showAddRowButton: false,
        showAddColumnButton: false,
        showPaginationToggle: false,
        showFilteringToggle: false,
        showImportExcel: false,
        showSelect: false,
        isRowDragEnabled: false,
        isColumnDragEnabled: false,
        isDragEnabled: true,
        EditerEnable: false,
        showExportExcel: false,
        showCategories:false
      };
    }

    if (feature in table.toggle) {
      table.toggle[feature] = !table.toggle[feature];
      console.log("      table.toggle[feature] = !table.toggle[feature]",      table.toggle[feature] = !table.toggle[feature])

    }
    console.log("table",table)
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();
  }

 toggleTableBorder(table: Table) {
    table.borderVisible = !table.borderVisible;
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();
  }

  toggleCellBorder(table: Table) {
    table.cellBorderVisible = !table.cellBorderVisible;
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();
  }






  setTableBorderVisibility(table: Table, visible: boolean) {
    table.borderVisible = visible;
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();
  }

  setBorderForSelectedCells(table: Table, border: string) {
    if (!table.cellStyles) {
      table.cellStyles = {};
    }
    this.selectedCells.forEach(cell => {
      if (!table.cellStyles![cell.rowIndex]) {
        table.cellStyles![cell.rowIndex] = {};
      }
      if (!table.cellStyles![cell.rowIndex][cell.column]) {
        table.cellStyles![cell.rowIndex][cell.column] = {};
      }
      table.cellStyles![cell.rowIndex][cell.column].border = border;
    });
    this.tableUpdated.emit(table.id);
    this.updateTable(table).subscribe();
  }

}
