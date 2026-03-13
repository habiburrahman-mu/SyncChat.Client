export enum MediaState {
  Unknown = 0,

  Initiated = 1,   // DB row created, upload not completed
  Uploaded = 2,    // Binary exists in storage
  Active = 3,      // Active Media
  Attached = 4,    // At least one MediaReference exists

  Deleting = 8,    // Async delete in progress
  Deleted = 9,     // Deleted
  Failed = 10      // Upload or processing failed
}
