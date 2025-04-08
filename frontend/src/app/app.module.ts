import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';



import { AppComponent } from './app.component';
import { MakingAppComponent } from './GestionUI/making-app/making-app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppReaderComponent } from './app-reader/app-reader.component';
import { HomeComponent } from './Websites/home.component';
import { S6o8o1RegisterComponent } from './GestionAuth/s6o8-auth/s6o8o1-register/s6o8o1-register.component';
import { S6o8o2LoginComponent } from './GestionAuth/s6o8-auth/s6o8o2-login/s6o8o2-login.component';
import { S6o7HomeComponent } from './layoutsComponents/s6o7-home/s6o7-home.component';
import { S6o6NavComponent } from './layoutsComponents/s6o6-nav/s6o6-nav.component';
import { S6o8o3ForgotPasswordComponent } from './GestionAuth/s6o8-auth/s6o8o3-forgot-password/s6o8o3-forgot-password.component';
import { S6o8o4ConfirmationMsgComponent } from './GestionAuth/s6o8-auth/s6o8o4-confirmation-msg/s6o8o4-confirmation-msg.component';
import { S6o5o1GestionDBComponent } from './layoutsComponents/s6o5-pages/s6o5o1-GestionDB/s6o5o1-GestionDB.component';
import { S6o5o2GestionRapportsComponent } from './layoutsComponents/s6o5-pages/s6o5o2-GestionRapports/s6o5o2-GestionRapports.component';
import { S6o9SidebarComponent } from './layoutsComponents/s6o9-sidebar/s6o9-sidebar.component';
import { S6o5o3GestionAccessComponent } from './layoutsComponents/s6o5-pages/s6o5o3-GestionAccess/s6o5o3-GestionAccess.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NavbarprincipaleComponent } from './GestionUI/navbarprincipale/navbarprincipale.component';
import { NavbarComponent } from './GestionUI/navbar/navbar.component';
import { FramelistComponent } from './GestionUI/framelist/framelist.component';
import { ParametreComponent } from './GestionUI/parametre/parametre.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { VisualsComponent } from './GestionDB/rapports/visuals/visuals.component';
import { AllCategoriesComponent } from './GestionDB/DB/all-categories/all-categories.component';
import { AllTablesComponent } from './GestionDB/DB/all-tables/all-tables.component';
import { ConceptionTableComponent } from './GestionDB/DB/conception-table/conception-table.component';
import { DataTableComponent } from './GestionDB/DB/data-table/data-table.component';
import { DataFormComponent } from './GestionDB/DB/data-form/data-form.component';
import { RapportTablesComponent } from './GestionDB/rapports/rapport-tables/rapport-tables.component';
import { CatTableComponent } from './GestionDB/rapports/cat-table/cat-table.component';
import { DataTablesComponent } from './GestionDB/rapports/data-tables/data-tables.component';
import { DataTableRapportComponent} from './GestionDB/rapports/data-table-rapport/data-table-rapport.component';
import { DataLinkedTableRapportComponent } from './GestionDB/rapports/data-linked-table-rapport/data-linked-table-rapport.component';
import { LinkedTableFormComponent } from './GestionDB/rapports/linked-table-form/linked-table-form.component';
import { DataTableFormComponent } from './GestionDB/rapports/data-table-form/data-table-form.component';
import { ExcelListComponent } from './GestionDB/DB/listType/excel-list/excel-list.component';
import { FromOurDBComponent } from './GestionDB/DB/listType/from-our-db/from-our-db.component';
import { ListComponent } from './GestionDB/DB/listType/list/list.component';
import { PredValComponent } from './GestionDB/DB/listType/pred-val/pred-val.component';
import { MatTableModule } from '@angular/material/table';
import { TableComponent } from './GestionUI/component/table/table.component';
import { TableConfigComponent } from './GestionUI/parametre/table-config/table-config.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { VerificationCodeComponent } from './GestionAuth/verification-code/verification-code.component';
import { ChangePasswordComponent } from './GestionAuth/change-password/change-password.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ResizableModule } from 'angular-resizable-element';
import { VisualPopupComponent } from './GestionDB/rapports/visual-popup/visual-popup.component';
import { ExcelTabComponent } from './GestionDB/DB/excel-tab/excel-tab.component';
import { ForeignKeyComponent } from './GestionDB/DB/foreign-key/foreign-key.component';
import { FromDBDialogComponent } from './GestionDB/DB/listType/from-dbdialog/from-dbdialog.component';
import { DatabaseSelectorComponent } from './GestionDB/DB/listType/database-selector/database-selector.component';
import { ConnectionDBComponent } from './GestionDB/DB/connection-db/connection-db.component';
import { SelectTableComponent } from './GestionDB/DB/select-table/select-table.component';
import { SidebarComponent } from './GestionUI/component/sidebar/sidebar.component';
import { SidebarService } from './services/sidebar.service';
import { faEdit, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { NavbarHorizontalComponent } from './navbar-horizontal/navbar-horizontal.component';
import { SidebarInstanceComponent } from './sidebar-instance/sidebar-instance.component'; // Importer AppRoutingModule
import { GraphsModule } from './GestionBI/graphs/graphs.module';
import { TextConfigComponent } from './GestionUI/parametre/text-config/text-config.component';
import { InputConfigComponent } from './GestionUI/parametre/input-config/input-config.component';
import { ImageConfigComponent } from './GestionUI/parametre/image-config/image-config.component';
import { ButtonConfigComponent } from './GestionUI/parametre/button-config/button-config.component';

import { CommonModule } from '@angular/common';
import { SidebarSettingsComponent } from './sidebar-settings/sidebar-settings.component';

import { MatCardModule } from '@angular/material/card';
import { DataBDComponent } from './GestionUI/component/data-bd/data-bd.component'; // Import MatCardModule
import { MatOptionModule } from '@angular/material/core';  // Ajoutez cette ligne
import { SegmentsFilterComponent } from './GestionBI/graphs/data-analysis/filter/segments-filter/segments-filter.component';
import { MatCheckboxModule } from '@angular/material/checkbox';  // Ajoutez cette ligne
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@NgModule({
  declarations: [
    SegmentsFilterComponent,

    AppComponent,
    SidebarComponent,
    MakingAppComponent,
    AppReaderComponent,
    HomeComponent,
    NavbarHorizontalComponent,
    SidebarInstanceComponent,
    S6o8o1RegisterComponent,
    S6o8o2LoginComponent,
    S6o7HomeComponent,
    S6o6NavComponent,
    S6o8o3ForgotPasswordComponent,
    S6o8o4ConfirmationMsgComponent,
    S6o5o1GestionDBComponent,
    S6o5o2GestionRapportsComponent,
    S6o9SidebarComponent,
    S6o5o3GestionAccessComponent,
    NavbarprincipaleComponent,
    NavbarComponent,
    FramelistComponent,
    ParametreComponent,
    AllCategoriesComponent,
    AllTablesComponent,
    ConceptionTableComponent,
    DataTableComponent,
    DataFormComponent,
    RapportTablesComponent,
    CatTableComponent,
    DataTablesComponent,
    DataTableRapportComponent,
    DataLinkedTableRapportComponent,
    LinkedTableFormComponent,
    DataTableFormComponent,
    ExcelListComponent,
    FromOurDBComponent,
    ListComponent,
    PredValComponent,
    VisualsComponent,
    VisualPopupComponent,
    ExcelTabComponent,
    ForeignKeyComponent,
    FromDBDialogComponent,
    DatabaseSelectorComponent,
    ConnectionDBComponent,
    SelectTableComponent,
    VerificationCodeComponent,
    ChangePasswordComponent,
    TableComponent,
    TableConfigComponent,
    VerificationCodeComponent,
    ChangePasswordComponent,
    TextConfigComponent,
    InputConfigComponent,
    ImageConfigComponent,
    ButtonConfigComponent,
    SidebarSettingsComponent,
    DataBDComponent,





  ],
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    MatCheckboxModule,
    MatOptionModule,
    MatChipsModule,
    MatCardModule,
    ResizableModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatInputModule,
    MatTooltipModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule,
    DragDropModule,
    MatFormFieldModule,
    MatSelectModule,

    FontAwesomeModule,
    AppRoutingModule,
    CommonModule,
    GraphsModule
  ],
  providers: [SidebarService],
  bootstrap: [AppComponent]
})
export class AppModule { }
