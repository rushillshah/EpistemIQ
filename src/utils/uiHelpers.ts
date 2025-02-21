export function formatLLMResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```[\w]*\n/, '');
  cleaned = cleaned.replace(/\n```$/, '');
  return cleaned.trim();
}
