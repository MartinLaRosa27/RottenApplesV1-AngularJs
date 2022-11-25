import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import axios from 'axios';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  // ------------------------------------------------------------------------------------------ //
  public reviews: any = null;
  public page: any = 0;

  // ------------------------------------------------------------------------------------------ //
  constructor() {}

  // ------------------------------------------------------------------------------------------ //
  private getReview = async () => {
    await axios
      .get(environment.baseUrl + 'review')
      .then((res) => {
        this.reviews = res.data;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ------------------------------------------------------------------------------------------ //
  ngOnInit() {
    this.getReview();
  }
}
