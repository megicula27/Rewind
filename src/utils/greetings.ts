/**
 * Rewind — Greeting Generator
 * 
 * Produces warm, time-appropriate greetings.
 * Never stressful, always encouraging.
 */

export function getGreeting(name: string | null): string {
  const hour = new Date().getHours();
  const displayName = name || 'Friend';

  if (hour < 5) {
    return `Still up, ${displayName}? 🌙`;
  }
  if (hour < 12) {
    return `Good morning,\n${displayName} 🌸`;
  }
  if (hour < 17) {
    return `Good afternoon,\n${displayName} ☀️`;
  }
  if (hour < 21) {
    return `Good evening,\n${displayName} 🌷`;
  }
  return `Sweet dreams,\n${displayName} 🌙`;
}

/**
 * Returns a warm, encouraging message based on completion progress.
 */
export function getProgressMessage(completed: number, total: number): string {
  if (total === 0) {
    return "No reminders yet.\nLet's set one up! 🌱";
  }

  const ratio = completed / total;

  if (ratio === 0) {
    return `You have ${total} reminders today.\nYou've got this! 🌱`;
  }
  if (ratio < 0.5) {
    return `You've completed ${completed} of ${total} reminders. Keep blooming! 🌸`;
  }
  if (ratio < 1) {
    return `You've completed ${completed} of ${total} reminders. Almost there! 💐`;
  }
  return `All ${total} reminders done!\nYou're a star! ⭐`;
}
