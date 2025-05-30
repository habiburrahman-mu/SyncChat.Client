import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToasterService } from '@core/services';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      handleError(error);
      return throwError(() => error);
    })
  );
};

function handleError(error: HttpErrorResponse) {
  const toasterService = inject(ToasterService);

  let message = 'An unexpected error occurred!';

  if (error.status >= 400 && error.status < 500) {
    message = `Client Error: ${error.status} - ${error.message}`;
    toasterService.warning('Warning', message);
  } else if (error.status >= 500) {
    message = `Server Error: ${error.status} - ${error.message}`;
    toasterService.error('Error', message);
  } else {
    toasterService.info('Info', message);
  }
}

