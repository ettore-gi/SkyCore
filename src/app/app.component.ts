import { Component } from '@angular/core';
import {HomepageComponent} from "../homepage/homepage.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomepageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'testCanvas';
}
