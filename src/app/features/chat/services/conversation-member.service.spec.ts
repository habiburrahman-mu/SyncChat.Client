import { TestBed } from '@angular/core/testing';

import { ConversationMemberService } from './conversation-member.service';

describe('ConversationMemberService', () => {
  let service: ConversationMemberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversationMemberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
