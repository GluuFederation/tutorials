import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../authenticaion.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService) {

  }

  ngOnInit() {
    this.authenticationService.handleCode();
  }
}
