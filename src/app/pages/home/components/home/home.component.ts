import { Component } from '@angular/core';
import { HomeHeaderComponent } from "../home-header/home-header.component";
import { HomeHeroComponent } from "../home-hero/home-hero.component";
import { HomeFeaturesComponent } from "../home-features/home-features.component";
import { HomeAboutComponent } from "../home-about/home-about.component";
import { HomeTestimonialsComponent } from "../home-testimonials/home-testimonials.component";
import { HomeFooterComponent } from "../home-footer/home-footer.component";

@Component({
  selector: 'chat-home',
  imports: [HomeHeaderComponent, HomeHeroComponent, HomeFeaturesComponent, HomeAboutComponent, HomeTestimonialsComponent, HomeFooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
