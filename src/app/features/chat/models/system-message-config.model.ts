import { SystemMessageType } from "@core/enums";

export interface SystemMessageConfig {
  type: SystemMessageType;
  getActors: (metaData: Record<string, any>) => number[]; // IDs of actors
  getTargets: (metaData: Record<string, any>) => number[]; // IDs of targets
  format: (actorNames: (string | undefined)[], targetNames: (string | undefined)[]) => string; // final message
}
