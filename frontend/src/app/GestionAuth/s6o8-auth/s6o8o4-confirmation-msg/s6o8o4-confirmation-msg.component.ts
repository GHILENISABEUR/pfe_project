import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-s6o8o4-confirmation-msg',
  templateUrl: './s6o8o4-confirmation-msg.component.html',
  styleUrls: ['./s6o8o4-confirmation-msg.component.css']
})
export class S6o8o4ConfirmationMsgComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  TS_OnCodeSent() {
    this.router.navigate(['/confirmation']);
  }
}
