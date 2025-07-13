import { ChatTimestampPipe } from './chat-timestamp.pipe';

describe('ChatTimestampPipe', () => {
  it('create an instance', () => {
    const pipe = new ChatTimestampPipe();
    expect(pipe).toBeTruthy();
  });
});
