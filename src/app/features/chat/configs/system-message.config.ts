import { SystemMessageType } from "@core/enums";
import { SystemMessageConfig } from "../models";

export const SYSTEM_MESSAGE_CONFIGS: SystemMessageConfig[] = [
  {
    type: SystemMessageType.ConversationCreated,
    getActors: meta => [Number(meta['CreatedBy'])],
    getTargets: meta => [],
    format: (actors, targets) => `${actors[0] || 'Someone'} created the conversation.`
  },
  {
    type: SystemMessageType.MemberAdded,
    getActors: meta => [Number(meta['AddedBy'])],
    getTargets: meta => [Number(meta['UserId'])],
    format: (actors, targets) => `${actors[0] || 'Someone'} added ${targets[0] || 'a member'}.`
  },
  {
    type: SystemMessageType.MemberLeft,
    getActors: meta => [Number(meta['UserId'])],
    getTargets: meta => [],
    format: (actors, targets) => `${actors[0] || 'Someone'} left the conversation.`
  },
  {
    type: SystemMessageType.MemberRemoved,
    getActors: meta => [Number(meta['RemovedBy'])],
    getTargets: meta => [Number(meta['UserId'])],
    format: (actors, targets) => `${actors[0] || 'Someone'} removed ${targets[0] || 'a member'}.`
  },
];
