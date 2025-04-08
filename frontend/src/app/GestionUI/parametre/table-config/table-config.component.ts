import { Component, ElementRef, Renderer2, AfterViewInit, ViewChild ,Input} from '@angular/core';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-table-config',
  templateUrl: './table-config.component.html',
  styleUrls: ['./table-config.component.css']
})
export class TableConfigComponent implements AfterViewInit {
  @Input() configMode: 'style' | 'functionality' = 'style';

  @ViewChild('tableColorPicker') tableColorPicker!: ElementRef;
  @ViewChild('cellColorPicker') cellColorPicker!: ElementRef;
  @ViewChild('textColorPicker') textColorPicker!: ElementRef;
  tableBackgroundColor: string = '';
  cellBackgroundColor: string = '';
  textColor: string = '';
  selectedFont: string = '';
  availableFonts: string[] = [ 'Arial',
  'Arial Black',
  'Courier New',
  'Georgia',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Palatino Linotype',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Comic Sans MS',
  'Garamond',
  'Bookman',
  'Brush Script MT',
  'Copperplate',
  'Papyrus',
  'Courier'];

isdesibled=true;
  constructor(public tableService: TableService, private renderer: Renderer2, private el: ElementRef) {}

  addRow() {
    if (this.tableService.selectedTable) {
      this.tableService.addRow(this.tableService.selectedTable);
    }
  }

  addColumn() {
    if (this.tableService.selectedTable) {
      const newColumnName = `column_${this.tableService.selectedTable.cols.length + 1}`;
      this.tableService.addColumn(this.tableService.selectedTable, newColumnName);
    }
  }

  removeSelectedRow() {
    if (this.tableService.selectedTable && this.tableService.selectedRowIndex !== null) {
      this.tableService.removeRow(this.tableService.selectedTable, this.tableService.selectedRowIndex);
      this.tableService.selectedRowIndex = null;
    }
  }

  removeSelectedColumn() {
    if (this.tableService.selectedTable && this.tableService.selectedColumn) {
      this.tableService.removeColumn(this.tableService.selectedTable, this.tableService.selectedColumn);
      this.tableService.selectedColumn = null;
    }
  }

  openTableColorPicker() {
    this.tableColorPicker.nativeElement.click();
  }

  changeTableBackground(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    if (this.tableService.selectedTable && color) {
      this.tableService.changeTableBackground(this.tableService.selectedTable, color);
    }
  }
  removeTable(){
    if (this.tableService.selectedTable && confirm('Are you sure you want to delete this table?')) {
      this.tableService.deleteTable(this.tableService.selectedTable.id!).subscribe(() => {
        this.tableService.selectedTable = null;
      });
    }
  }
  openCellColorPicker() {
    console.log(this.cellColorPicker.nativeElement.click());
    this.cellColorPicker.nativeElement.click();
  }

  changeCellBackground(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    if (this.tableService.selectedTable && color) {
      this.tableService.changeCellBackground(this.tableService.selectedTable, color);
    }
  }

  openTextColorPicker() {
   console.log(this.textColorPicker.nativeElement.click())
    this.textColorPicker.nativeElement.click();
  }

  changeTextColor(event: Event) {
    console.log("color",event);

    const color = (event.target as HTMLInputElement).value;
    console.log("color",color);
    if (this.tableService.selectedTable && color) {
      this.tableService.changeTextColor(this.tableService.selectedTable, color);
    }
  }

  changeCellFont(font: string) {
    console.log("color",font);
    if (this.tableService.selectedTable && font) {
      this.tableService.changeCellFont(this.tableService.selectedTable, font);
    }
  }

  ngAfterViewInit() {
this.isdesibled=true;
    const div = this.el.nativeElement.querySelector('div');
    this.renderer.listen(div, 'click', this.onDivClick.bind(this));
  }

  onDivClick(event: Event) {
    console.log('Div was clicked!', event);
  }
  toggleButton(feature: string) {
    if (this.tableService.selectedTable) {

   this.tableService.toggleButton(feature,this.tableService.selectedTable!);


  }}
  toggleTableBorder() {
    if (this.tableService.selectedTable) {
      this.tableService.toggleTableBorder(this.tableService.selectedTable);
    }
  }

  toggleCellBorder() {
    if (this.tableService.selectedTable) {
      this.tableService.toggleCellBorder(this.tableService.selectedTable);
    }
  }

  showStyleConfig() {

    this.tableService.selectedTable!.isStyleConfig = true;
    this.tableService.selectedTable!.isFunctionalityConfig = false;
  }

  showFunctionalityConfig() {
    this.tableService.selectedTable!.isStyleConfig = false;

    this.tableService.selectedTable!.isFunctionalityConfig = true;

  }



  addTableBorder() {
    if (this.tableService.selectedTable) {
      this.tableService.setTableBorderVisibility(this.tableService.selectedTable, true);
    }
  }

  removeTableBorder() {
    if (this.tableService.selectedTable) {
      this.tableService.setTableBorderVisibility(this.tableService.selectedTable, false);
    }
  }

  addCellBorder() {
    if (this.tableService.selectedTable) {
      this.tableService.setBorderForSelectedCells(this.tableService.selectedTable, '1px solid #ddd');
    }
  }

  removeCellBorder() {
    if (this.tableService.selectedTable) {
      this.tableService.setBorderForSelectedCells(this.tableService.selectedTable, 'none');
    }
  }
}
