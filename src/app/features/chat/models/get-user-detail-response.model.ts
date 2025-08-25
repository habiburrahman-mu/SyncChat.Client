export interface GetUserDetailResponse {
  userId: number;
  uuid: string;
  userName: string;
  name: string;
  email: string;
  phone?: string;
  profile: any; // Consider using a more specific type if you know the JSON structure
  status: 'Active' | 'Inactive' | 'Suspended' | 'Deleted'; // Adjust based on your UserStatus enum
  lastActive?: string; // ISO date string
  createdAt: string;   // ISO date string
  isVerified: boolean;
  isBanned: boolean;
}
