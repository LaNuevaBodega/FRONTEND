import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from '../Service/SignalRService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  protected title = 'distribuidora';

  constructor(private signalR: SignalRService) { }

  ngOnInit(): void {    
  }

}
