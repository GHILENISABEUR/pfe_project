import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service'; 

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  form!: FormGroup;
  varS_passwordFieldType: string = 'password';
  varS_errorMessage: string = '';

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(1)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  TS_Submit(): void {
    console.log('Form Submitted'); // Debugging line
    if (this.form.valid) {
      const { password, confirmPassword } = this.form.value;
      if (password !== confirmPassword) {
        this.varS_errorMessage = 'Passwords do not match';
        return;
      }
  
      this.userService.changePassword(password).subscribe(
        response => {
          console.log('Password changed successfully:', response);
          this.router.navigate(['/']); // Redirect to the desired route after successful password change
        },
        error => {
          console.error('Password change failed:', error);
          this.varS_errorMessage = 'Password change failed. Please try again.';
        }
      );
    }
  }
  

  TS_togglePasswordVisibility() {
    this.varS_passwordFieldType = this.varS_passwordFieldType === 'password' ? 'text' : 'password';
  }
}
