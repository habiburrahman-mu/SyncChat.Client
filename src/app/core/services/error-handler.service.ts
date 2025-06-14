import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToasterService } from './toaster.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  constructor(private toaster: ToasterService) {}

  handle(error: HttpErrorResponse) {
    let message = 'An unexpected error occurred!';

    if (error.status === 0) {
      this.toaster.error('Network Error', 'Unable to connect to the server. Please check your connection.');
    }
    else if (error.status >= 400 && error.status < 500) {
      message = error.error?.detail || 'A client error occurred.';
      this.toaster.warning(`Client Error: ${error.status}`, message);
    } else if (error.status >= 500) {
      message = `Server Error: ${error.status} - ${error.message}`;
      this.toaster.error('Error', message);
    } else {
      this.toaster.info('Info', message);
    }
  }
}
