import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-routes',
  imports: [MatIcon, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.scss',
})
export class RoutesComponent {

}
