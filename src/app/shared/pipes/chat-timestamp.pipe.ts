import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatTimestamp'
})
export class ChatTimestampPipe implements PipeTransform {

  transform(value: string): string {
    const date = new Date(value);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    }
  }

}
