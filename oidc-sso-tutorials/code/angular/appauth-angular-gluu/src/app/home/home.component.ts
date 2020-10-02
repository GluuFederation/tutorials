import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../authenticaion.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit() {}

  redirect() {
    this.authenticationService.redirect();
  }
}
