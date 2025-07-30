import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private http = inject(HttpClient);
  protected title = 'client';

  ngOnInit() {
    this.http.get('https://localhost:5001/api/members').subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching members:', error);
      },
      complete: () => {
        console.log('Request completed');
      },
    });
  }
}
