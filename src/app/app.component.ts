
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map, merge, Observable, startWith, Subject, switchMap } from 'rxjs';
import { NotificationService } from '@core/services';
import { PwaInstallPromptComponent } from '@shared/components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallPromptComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'SyncChat.Client';

  forecasts$!: Observable<any[]>;
  _buttonClicked$ = new Subject<void>;

  private apiUrl = 'https://localhost:5001/weatherforecasts';  // Adjust your API URL

  private _httpClient = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.forecasts$ = this._buttonClicked$.pipe(
      startWith(undefined),
      switchMap(() => this.getForecasts())
    );

    this.notificationService.requestPermission().catch(() => null);
  }

  getForecasts(): Observable<any[]> {
    return this._httpClient.get<any[]>(this.apiUrl);
  }

  onClick() {
    this._buttonClicked$.next();
    console.log("Test");
  }
}
