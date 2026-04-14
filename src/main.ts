import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

function setAppHeight() {
  const height = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
}

setAppHeight();
window.addEventListener('resize', setAppHeight);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
