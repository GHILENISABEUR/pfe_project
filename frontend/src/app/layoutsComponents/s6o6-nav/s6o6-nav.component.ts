import { Component, OnInit } from '@angular/core';
import { S_AuthService } from '../../GestionAuth/services/authentifService/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

declare const gapi: any;

@Component({
  selector: 'app-s6o6-nav',
  templateUrl: './s6o6-nav.component.html',
  styleUrls: ['./s6o6-nav.component.css'],
})
export class S6o6NavComponent implements OnInit {
  VarB_isLogin: boolean = false; // Tracks login status
  VarB_showLogoutWindow: boolean = false; // Toggles logout window

  constructor(
    public V_authService: S_AuthService,
    public userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUser.subscribe((user) => {
      console.log('Current user:', user); // Debug log for current user
      this.VarB_isLogin = !!(user && user.full_name); // Check if user and user.full_name exist
      console.log('isLogin:', this.VarB_isLogin); // Debug log for login status
    });
  }

  TS_toggleLogoutWindow(): void {
    this.VarB_showLogoutWindow = !this.VarB_showLogoutWindow; // Toggles the logout window display
  }

  TS_navigateToSignup(): void {
    this.router.navigate(['/register']); // Navigates to the signup page
  }

  TS_Logout() {
    this.userService.logout().subscribe(() => {
      if (typeof gapi !== 'undefined' && gapi.auth2) {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2) {
          auth2.signOut().then(() => {
            console.log('User signed out.');
          });
        }
      }
      this.VarB_showLogoutWindow = false;
      this.VarB_isLogin = false;
    });
  }
}

