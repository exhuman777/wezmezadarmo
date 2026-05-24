/**
 * Wrapper na Vercel Analytics custom events.
 * Used in: intake form, chat, signup, NIP check.
 *
 * Brak danych osobowych w eventach (zgodnie z RODO):
 * - Bez emaili, imion, NIP-ow, kwot dochodu
 * - Tylko enumy / countery / kategorie
 */

import { track as vercelTrack } from '@vercel/analytics';

type EventName =
  | 'quiz_started'
  | 'quiz_completed'
  | 'signup_started'
  | 'signup_completed'
  | 'chat_first_message'
  | 'chat_message_sent'
  | 'nip_checked'
  | 'tool_opened'
  | 'subscription_created'
  | 'blog_read';

type EventProps = Record<string, string | number | boolean | null>;

export function track(name: EventName, props?: EventProps): void {
  try {
    vercelTrack(name, props);
  } catch {
    // Analytics nie powinien crashowac aplikacji
  }
}
