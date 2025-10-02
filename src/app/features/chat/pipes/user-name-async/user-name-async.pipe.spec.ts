import { UserNameAsyncPipe } from './user-name-async.pipe';

describe('UserNameAsyncPipe', () => {
  it('create an instance', () => {
    const pipe = new UserNameAsyncPipe();
    expect(pipe).toBeTruthy();
  });
});
