import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GraphsRoutingModule } from './graphs-routing.module';
import { ReportsComponent } from './data-analysis/python-compiler/reports/reports.component';
import { CausesComponent } from './data-analysis/python-compiler/causes/causes.component';
import { ConsequencesComponent } from './data-analysis/python-compiler/consequences/consequences.component';
import { DocumentsComponent } from './data-analysis/python-compiler/reports/documents/documents.component';
import { DataAnalysisComponent } from './data-analysis/data-analysis.component'; // Add this import if needed
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PythonCompilerComponent } from './data-analysis/python-compiler/python-compiler.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DraggableTabDirective } from './draggable-tab.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarInstanceGraphComponent } from './data-analysis/sidebar/sidebar-instance-graph/sidebar-instance-graph.component';
import { SidebarGraphsComponent } from './data-analysis/sidebar/sidebar-graphs/sidebar-graphs.component';
import { ResizableModule } from 'angular-resizable-element';
import { SidebarSettingsGraphsComponent } from './data-analysis/sidebar/sidebar-settings-graphs/sidebar-settings-graphs.component';
import { FileUploadComponent } from './data-analysis/data/file-upload/file-upload.component';
import { ChronologyFilterComponent } from './data-analysis/filter/chronology-filter/chronology-filter.component';
import { FiltersSelectionComponent } from './data-analysis/filter/filters-selection/filters-selection.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [

    ReportsComponent,
    CausesComponent,
    ConsequencesComponent,
    DocumentsComponent,
    DataAnalysisComponent, // Ensure this declaration if needed
    PythonCompilerComponent, // Ensure this declaration
    DraggableTabDirective, SidebarInstanceGraphComponent, SidebarGraphsComponent, SidebarSettingsGraphsComponent, FileUploadComponent, ChronologyFilterComponent, FiltersSelectionComponent,
  ],
  imports: [ResizableModule,
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    GraphsRoutingModule,
    MatTabsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    DragDropModule,
    MatIconModule,
    MatInputModule,
    FontAwesomeModule,
  ],
  exports: [
    ReportsComponent,
    CausesComponent,
    ConsequencesComponent,
  ]
})
export class GraphsModule { }
