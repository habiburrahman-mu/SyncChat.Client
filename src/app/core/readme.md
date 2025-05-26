📁 core/ — Application-wide, singleton services and config
The core folder is for things that are instantiated once and live for the lifetime of the app.
Think of it as your app’s backbone.

📌 Typical contents:
| Item                          | Example                                            |
| :---------------------------- | :------------------------------------------------- |
| **Services (singleton)**      | `AuthService`, `ApiService`, `ErrorHandlerService` |
| **Guards**                    | `AuthGuard`, `AdminGuard`                          |
| **Interceptors**              | `AuthInterceptor`, `ErrorInterceptor`              |
| **App-wide config/constants** | `environment.ts`, `app-config.ts`                  |
| **CoreModule** (if needed)    | `CoreModule` importing and providing the above     |
| **Base error handler**        | Custom `ErrorHandler` implementation               |


✅ Rule of thumb: If it’s a singleton service, app-wide config, or infrastructure concern → it goes in core/.
