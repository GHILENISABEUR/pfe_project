import { Component } from '@angular/core';
import { S_AuthService } from '../../services/authentifService/auth.service';

@Component({
  selector: 'app-s6o8o3-forgot-password',
  templateUrl: './s6o8o3-forgot-password.component.html',
  styleUrls: ['./s6o8o3-forgot-password.component.css'],
})
export class S6o8o3ForgotPasswordComponent {
  VarS_Email: string = '';

  constructor(private authService: S_AuthService) {}

  TS_Sce_OnSubmit() {
    this.authService.forgotPassword(this.VarS_Email).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
