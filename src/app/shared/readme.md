📁 shared/ — Reusable UI components, pipes, and directives
The shared folder is for dumb, stateless, reusable pieces of UI or utilities
Think of it as your app’s toolbox.

📌 Typical contents:
| Item                    | Example                                                              |
| :---------------------- | :------------------------------------------------------------------- |
| **Reusable components** | `ButtonComponent`, `CardComponent`, `LoadingSpinnerComponent`        |
| **Pipes**               | `DateFormatPipe`, `SafeHtmlPipe`                                     |
| **Directives**          | `AutoFocusDirective`, `RoleBasedDisplayDirective`                    |
| **SharedModule**        | Module that declares and exports the above for other feature modules |


✅ Rule of thumb: If it’s a UI building block or utility that can be reused across multiple features → it goes in shared/.
