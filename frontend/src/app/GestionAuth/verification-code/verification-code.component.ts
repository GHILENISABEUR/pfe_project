import { Component, AfterViewInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-verification-code',
  templateUrl: './verification-code.component.html',
  styleUrls: ['./verification-code.component.css']
})
export class VerificationCodeComponent implements AfterViewInit {
  VarTab_code: string[] = ['', '', '', ''];

  constructor(
    private renderer: Renderer2, 
    private userService: UserService, 
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    const inputElements = Array.from(document.querySelectorAll('.CSS_input-field input')) as HTMLInputElement[];
    inputElements.forEach((input, index) => {
      this.renderer.listen(input, 'input', (event: Event) => {
        const currentInput = event.target as HTMLInputElement;
        const inputValue = currentInput.value.trim().slice(0, 1);
        currentInput.value = inputValue;

        if (inputValue !== '' && index < inputElements.length - 1) {
          inputElements[index + 1].removeAttribute('disabled');
          inputElements[index + 1].focus();
        }
      });
    });

    inputElements[0].removeAttribute('disabled');
    inputElements[0].focus();
  }

  TS_Sce_verifyCode(): void {
    const code = this.VarTab_code.join('');
    console.log('Verification code:', code);
    this.userService.verifyCode(code).subscribe(
      response => {
        console.log('Verification successful:', response);
        this.router.navigate(['/change-password']); // Example redirection after successful verification
      },
      error => {
        console.error('Verification failed:', error);
        alert('Verification failed. Please try again.');
      }
    );
  }
}
