import { UserStatus } from "@core/enums";

export interface GetUserDetailResponse {
  userID: number;
  uuid: string;
  userName: string;
  name: string;
  email: string;
  phone?: string;
  profile: any; // Consider using a more specific type if you know the JSON structure
  status: UserStatus; // Adjust based on your UserStatus enum
  lastActive?: string; // ISO date string
  createdAt: string;   // ISO date string
  isVerified: boolean;
  isBanned: boolean;
  avatarUrl?: string; // Optional, in case the user doesn't have an avatar
}
