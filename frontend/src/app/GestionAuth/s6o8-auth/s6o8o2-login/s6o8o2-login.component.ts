import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service'; 

declare var google: any;

@Component({
  selector: 'app-s6o8o2-login',
  templateUrl: './s6o8o2-login.component.html',
  styleUrls: ['./s6o8o2-login.component.css'],
})
export class S6o8o2LoginComponent implements OnInit {
  // Form variable (should not be modified)
  form!: FormGroup;

  // String variable
  VarS_PasswordFieldType: string = 'password';

  // String variable
  VarS_ErrorMessage: string = '';

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.TS_InitializeGoogleSignIn();
  }

  TS_InitializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: '835235600448-uqpu4ohocelmu1nmohjv1q6hqvajejam.apps.googleusercontent.com',
      callback: (response: any) => {
        this.TS_HandleGoogleSignIn(response.credential);
      },
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      {
        theme: 'outline',
        size: 'large',
      }
    );
  }

  TS_HandleGoogleSignIn(VarS_Token: string): void {
    this.userService.verifyGoogleToken(VarS_Token).subscribe(
      (response) => {
        if (response.success) {
          this.router.navigate(['/']); // Redirect to home page on successful login
        } else {
          this.VarS_ErrorMessage = 'Google login failed. Please try again.';
        }
      },
      (error) => {
        this.VarS_ErrorMessage = error.message || 'Google login failed. Please try again.';
      }
    );
  }

  TS_Submit(): void {
    // Form variables (should not be modified)
    const { email, password } = this.form.getRawValue();

    this.userService.login(email, password).subscribe(
      () => {
        this.router.navigate(['/']); // Redirect to home page on successful login
      },
      (error) => {
        if (error.status === 400) {
          this.VarS_ErrorMessage = 'Invalid credentials. Please try again.';
        } else if (error.status === 404) {
          this.VarS_ErrorMessage = 'User not found. Please check your email.';
        } else {
          this.VarS_ErrorMessage = 'Login failed. Please try again later.';
        }
      }
    );
  }

  TS_TogglePasswordVisibility(): void {
    this.VarS_PasswordFieldType = this.VarS_PasswordFieldType === 'password' ? 'text' : 'password';
  }
}
