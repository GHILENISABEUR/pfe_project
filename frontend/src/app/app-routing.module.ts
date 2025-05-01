import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MakingAppComponent } from './GestionUI/making-app/making-app.component';
import { AppReaderComponent } from './app-reader/app-reader.component';

import { HomeComponent } from './Websites/home.component';
import { S6o7HomeComponent } from './layoutsComponents/s6o7-home/s6o7-home.component';
import { S6o8o2LoginComponent } from './GestionAuth/s6o8-auth/s6o8o2-login/s6o8o2-login.component';
import { S6o8o1RegisterComponent } from './GestionAuth/s6o8-auth/s6o8o1-register/s6o8o1-register.component';
import { VerificationCodeComponent } from './GestionAuth/verification-code/verification-code.component'
import { UserGAdressComponent } from './GestionAuth/user-g-adress/user-g-adress.component';
import { S6o8o3ForgotPasswordComponent } from './GestionAuth/s6o8-auth/s6o8o3-forgot-password/s6o8o3-forgot-password.component';
import { S6o8o4ConfirmationMsgComponent } from './GestionAuth/s6o8-auth/s6o8o4-confirmation-msg/s6o8o4-confirmation-msg.component';
import { S6o5o1GestionDBComponent } from './layoutsComponents/s6o5-pages/s6o5o1-GestionDB/s6o5o1-GestionDB.component';
import { S6o5o2GestionRapportsComponent } from './layoutsComponents/s6o5-pages/s6o5o2-GestionRapports/s6o5o2-GestionRapports.component';
import { S6o5o3GestionAccessComponent } from './layoutsComponents/s6o5-pages/s6o5o3-GestionAccess/s6o5o3-GestionAccess.component';


import { ChangePasswordComponent } from './GestionAuth/change-password/change-password.component';







import { SidebarComponent } from './GestionUI/component/sidebar/sidebar.component';
import { NavbarHorizontalComponent } from './navbar-horizontal/navbar-horizontal.component';
import { RedirectComponent } from './redirect/redirect.component';



const routes: Routes = [
  { path: '', component: S6o7HomeComponent },
  { path: 'login', component: S6o8o2LoginComponent },
  { path: 'redirect-to-django', component: RedirectComponent },
  {path: 'redirect-to-chart', component: RedirectComponent},
  {path: 'redirect-to-google-form', component: RedirectComponent},
  { path: 'register', component: S6o8o1RegisterComponent },
  { path: 'user-g-adress',component:UserGAdressComponent },
  { path: 'forgot-pwd', component: VerificationCodeComponent },
  { path: 'forgot-password', component: S6o8o3ForgotPasswordComponent },
  { path: 'confirmation', component: S6o8o4ConfirmationMsgComponent },
  { path: 'GestionDB/:id', component: S6o5o1GestionDBComponent },
  { path: 'GestionRapports/:id', component: S6o5o2GestionRapportsComponent},
  { path: 'GestionAccess/:id', component: S6o5o3GestionAccessComponent},
  {path:'change-password',component:ChangePasswordComponent},
  {
    path:"making-app/:id",
    component:MakingAppComponent
  },
  {
    path: "app-reader/:id",
    component: AppReaderComponent
  },
  {
    path: "websites",
    component:HomeComponent
  },
  {
    path: 'GestionBI/:id',
    loadChildren: () => import('./GestionBI/graphs/graphs.module').then(m => m.GraphsModule),
  },

  {path:'SidebarComponent',component:SidebarComponent},

  { path: 'navbar', component: NavbarHorizontalComponent }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
