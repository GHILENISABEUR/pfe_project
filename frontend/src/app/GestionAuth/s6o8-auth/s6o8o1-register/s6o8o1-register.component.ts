import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-s6o8o1-register',
  templateUrl: './s6o8o1-register.component.html',
  styleUrls: ['./s6o8o1-register.component.css']
})
export class S6o8o1RegisterComponent implements OnInit {
  form!: FormGroup;
  // String variable
  VarS_Message: string = '';
  // String variable
  VarS_PasswordFieldType: string = 'password';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  TS_Submit(): void {
    if (this.form.invalid) {
      this.VarS_Message = 'Please fill in all the required fields correctly.';
      return;
    }

    // Form variables (should not be modified)
    const { full_name, email, password } = this.form.getRawValue();
    console.log("Form data being sent:", { full_name, email, password });
    
    this.userService.signup(full_name, email, password).subscribe({
      next: (response) => {
        console.log('Registration successful');
        this.VarS_Message = 'Registration successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000); // Redirect after 2 seconds
      },
      error: (error) => {
        console.error('Error:', error);
        this.VarS_Message = error; // Show detailed error message
      }
    });
  }

  TS_TogglePasswordVisibility() {
    this.VarS_PasswordFieldType = this.VarS_PasswordFieldType === 'password' ? 'text' : 'password';
  }
}

