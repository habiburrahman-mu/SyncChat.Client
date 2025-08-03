import { computed, inject, Injectable, signal } from '@angular/core';
import { ChatNotification } from '@core/models';
import { catchError, filter, from, Observable, of, shareReplay, Subject, switchMap, throwError } from 'rxjs';
import { HubConnection, HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr'
import { ChatNotificationType } from '@core/enums';
import { BASE_URL } from '@core/constants';
import { AuthService } from '../auth/auth.service';
import { environment } from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly authService = inject(AuthService);

  private connection!: HubConnection;
  private _isConnected = signal(false);
  private _connect$?: Observable<void>;
  private _joinedGroups = signal<Set<string>>(new Set());

  private event$ = new Subject<ChatNotification<any>>();

  readonly isConnected = computed(() => this._isConnected());
  readonly joinedGroups = computed(() => this._joinedGroups());

  private readonly signalRHubURL = environment.notificationHubUrl;

  connect(): Observable<void> {
    // Already connected
    if (this._isConnected()) return of(void 0);

    // Connection is in progress
    if (this._connect$) return this._connect$;

    // Build connection
    this.connection = new HubConnectionBuilder()
      .withUrl(this.signalRHubURL, {
        accessTokenFactory: () => this._getAccessToken(),
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this._registerHandlers();

    this.connection.onclose(() => {
      this._isConnected.set(false);
      this._connect$ = undefined; // reset so connect can be retried
    });

    this.connection.onreconnected(() => {
      this._isConnected.set(true);
      this._rejoinAllGroups();
    });

    this._connect$ = from(this.connection.start()).pipe(
      switchMap(() => {
        this._isConnected.set(true);
        return of(void 0);
      }),
      catchError(err => {
        this._isConnected.set(false);
        this._connect$ = undefined; // reset so retry works
        console.error('SignalR connection failed:', err);
        return throwError(() => err);
      }),

      // Share the same observable for all concurrent calls
      // and complete it only once
      // Ensures no double connections
      // Automatically cached until disconnect
      shareReplay(1)
    );
    return this._connect$;
  }

  listen<T>(eventType: string) {
    return this.event$.asObservable().pipe(
      filter(e => e.type === eventType)
    ) as Subject<ChatNotification<T>>;
  }

  joinGroup(groupName: string) {
    return this.connect().pipe(
      switchMap(() => {
        if (this._joinedGroups().has(groupName)) return of(void 0);
        return from(this.connection.invoke('JoinGroup', groupName)).pipe(
          switchMap(() => {
            const updated = new Set(this._joinedGroups());
            updated.add(groupName);
            this._joinedGroups.set(updated);
            return of(void 0);
          })
        );
      })
    );
  }

  leaveGroup(groupName: string) {
    if (!this._isConnected()) return;
    this.connection.invoke('LeaveGroup', groupName)
      .then(() => {
        const updated = new Set(this._joinedGroups());
        updated.delete(groupName);
        this._joinedGroups.set(updated);
      })
      .catch(console.error);
  }

  disconnect() {
    if (!this.connection || !this._isConnected()) return;
    this.connection.stop()
      .then(() => {
        this._isConnected.set(false);
        this._joinedGroups.set(new Set());
      })
      .catch(console.error);
  }

  // private _registerHandlers() {
  //   this.connection.on('MessageReceived', (data: any) => {
  //     this._emit('MessageReceived', data);
  //   });
  // }

  private _registerHandlers() {
    // Get all event names from enum ChatNotificationType as strings
    const eventTypes = Object.values(ChatNotificationType);

    for (const eventType of eventTypes) {
      this.connection.on(eventType, (data: any) => {
        this._emit(eventType, data);
      });
    }
  }


  private _emit<T>(type: ChatNotificationType, data: T) {
    this.event$.next({ type, data });
  }

  private _rejoinAllGroups() {
    this._joinedGroups().forEach(group =>
      this.connection.invoke('JoinGroup', group).catch(console.error)
    );
  }

  private _getAccessToken(): string {
    return this.authService.getAccessToken() ?? '';
  }
}
