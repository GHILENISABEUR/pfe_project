import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-g-adress',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-g-adress.component.html',
  styleUrls: ['./user-g-adress.component.css']
})
export class UserGAdressComponent {
  VarS_errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  Form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  TS_Sce_SubmitF1(): void {
    const { email } = this.Form.getRawValue();
    this.userService.forgotPassword(email).subscribe(
      () => {
        this.router.navigate(['/forgot-pwd']);
      },
      (error: any) => {
        if (error.status === 400) {
          this.VarS_errorMessage = 'Invalid email. Please try again.';
        } else if (error.status === 404) {
          this.VarS_errorMessage = 'User not found. Please check your email.';
        }
      }
    );
  }

  TS_redirect(): void {
    this.router.navigate(['/forgot-pwd']);
  }
}
