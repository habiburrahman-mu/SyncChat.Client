import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToasterService } from '../toaster/toaster.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  constructor(private toaster: ToasterService) { }

  handle(error: HttpErrorResponse) {
    let message = 'An unexpected error occurred!';

    if (error.status === 0) {
      this.toaster.error('Network Error', 'Unable to connect to the server. Please check your connection.');
    }
    else if( error.status === 401) {
      return;
    }
    else if (error.status >= 400 && error.status < 500) {

      if (error.error.errors && error.error.errors instanceof Array && error.error.errors.length > 0) {
        error.error.errors.forEach((err: string) => {
          this.toaster.warning('Client Error', err);
        });
      } else {
        message = error.error?.detail || 'A client error occurred.';
        this.toaster.warning(`Client Error: ${error.status}`, message);
      }
    } else if (error.status >= 500) {
      message = `Server Error: ${error.status} - ${error.message}`;
      this.toaster.error('Error', message);
    } else {
      this.toaster.info('Info', message);
    }
  }
}
