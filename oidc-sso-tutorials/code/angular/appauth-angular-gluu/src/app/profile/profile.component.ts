import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  accessToken: string = null;
  userInfo: any = null;
  error: any = null;
  images: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.accessToken = localStorage.getItem('access_token') || null;
    if (!this.accessToken) {
      return;
    }

    this.http.get(environment.OPServer + environment.userInfoEndpoint, {headers: {authorization: 'Bearer ' + this.accessToken}})
      .subscribe((response) => {
        this.userInfo = response;
      });

    this.http.get(`${environment.ggEndpoint}/posts`, {headers: {authorization: 'Bearer ' + this.accessToken}})
      .subscribe((response) => {
        this.images = response;
      }, (error) => {
        console.log(error);
      });
  }
}
