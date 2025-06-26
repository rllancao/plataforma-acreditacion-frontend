import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Login} from './login/login';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,FormsModule ],
  templateUrl: './app.html',
})
export class App {
  protected title = 'plataforma-front';
}
