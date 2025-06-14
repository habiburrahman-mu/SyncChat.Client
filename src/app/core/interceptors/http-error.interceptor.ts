import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToasterService } from '@core/services';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasterService = inject(ToasterService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      handleError(error, toasterService);
      return throwError(() => error);
    })
  );
};

function handleError(error: HttpErrorResponse, toasterService: ToasterService) {
  let message = 'An unexpected error occurred!';

  if (error.status === 0) {
    toasterService.error('Network Error', 'Unable to connect to the server. Please check your connection.');
  }
  else if (error.status >= 400 && error.status < 500) {
    message = error.error.detail;
    toasterService.warning(`Client Error: ${error.status}`, message);
  } else if (error.status >= 500) {
    message = `Server Error: ${error.status} - ${error.message}`;
    toasterService.error('Error', message);
  } else {
    toasterService.info('Info', message);
  }
}

