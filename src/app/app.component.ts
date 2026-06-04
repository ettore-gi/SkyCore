import { Component } from '@angular/core';
import {HomepageComponent} from "../homepage/homepage.component";
import {TestCanvasMapComponent} from "../test-canvas-map/test-canvas-map.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomepageComponent, TestCanvasMapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'testCanvas';
}
