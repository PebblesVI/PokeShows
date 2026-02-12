// Post-show follow-up email template utilities
// The actual email HTML is built inline in the cron route for simplicity
// This file exports shared helpers if needed in the future

export function buildFollowupEmailSubject(showName: string): string {
  return `How was ${showName}? Rate it and find more shows`;
}
