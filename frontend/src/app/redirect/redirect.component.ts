import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  template: '',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const currentPath = this.router.url;
    
    if (currentPath === '/redirect-to-django') {
      window.location.href = 'http://127.0.0.1:8000/generator';
    } else if (currentPath === '/redirect-to-chart') {
      window.location.href = 'http://127.0.0.1:8000/insights';
    }
    else if (currentPath === '/redirect-to-google-form') {
      window.location.href = 'http://127.0.0.1:8000/login'; // Adjusted for Google Form URL
    }
  }
}
