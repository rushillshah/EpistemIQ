import {
  quizLoadingMessages,
  explanationLoadingMessages,
  followupLoadingMessages,
} from '../config';

export function formatLLMResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```[\w]*\n/, '');
  cleaned = cleaned.replace(/\n```$/, '');
  return cleaned.trim();
}

export function getRandomLoadingMessage(
  type: 'quiz' | 'understanding' | 'followup'
): string {
  let messages: string[];
  switch (type) {
    case 'quiz':
      messages = quizLoadingMessages;
      break;
    case 'understanding':
      messages = explanationLoadingMessages;
      break;
    case 'followup':
      messages = followupLoadingMessages;
      break;
    default:
      messages = ['Loading...'];
  }
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
