import { MediaState } from "@core/enums";

export interface GetMediaStateResponse {
  mediaId: string;
  mediaState: MediaState;
}
