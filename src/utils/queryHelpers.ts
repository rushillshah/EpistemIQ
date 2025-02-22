import * as vscode from 'vscode';

import {
  optionsPrompt,
  fixPrompt,
  initialSnippetPrompt,
  quizPrompt,
  feedbackPrompt,
  followupSnippetPrompt,
} from './prompts';

import { LLM_API_URL } from '../config';

export function cleanJSONResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    const firstLineBreak = cleaned.indexOf('\n');
    if (firstLineBreak !== -1) {
      cleaned = cleaned.substring(firstLineBreak + 1);
    }
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.lastIndexOf('```'));
  }
  return cleaned.trim();
}

export async function callLLM(prompt: string): Promise<any> {
  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return await response.json();
}

export async function queryLLMForOptions(
  diagnostic: vscode.Diagnostic
): Promise<Option[]> {
  const prompt = optionsPrompt(diagnostic);
  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    vscode.window.showErrorMessage(
      'LLM API did not return candidate text for options.'
    );
    return [];
  }
  const cleanedText = cleanJSONResponse(candidateText);
  console.log(cleanedText);
  try {
    const options = JSON.parse(cleanedText) as Option[];
    return options;
  } catch (e) {
    vscode.window.showErrorMessage(
      'Failed to parse options from candidate text.'
    );
    return [];
  }
}

export async function queryLLMForFixSuggestion(
  diagnostic: vscode.Diagnostic,
  document: vscode.TextDocument
): Promise<string> {
  const fullFileContent = document.getText();

  const prompt = fixPrompt(diagnostic, fullFileContent);
  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    vscode.window.showErrorMessage(
      'LLM API did not return candidate text for fix suggestion.'
    );
    return '';
  }
  return cleanJSONResponse(candidateText);
}

export async function summarizeCode(selectedCode: string): Promise<string> {
  const prompt = `Summarize the following code snippet in under 50 words. Be sure to include all key hooks (e.g. useEffect hooks), functions, and any special handlers (like handleLeaveChannel) that are present. Return only the summary in plain text.
---------------------
${selectedCode}
---------------------`;
  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return cleanJSONResponse(candidateText);
}

export async function generateSnippetExplanation(
  selectedCode: string,
  userInput: string,
  followup: boolean = false,
  previousContext: string = '',
  codeSummary: string = ''
): Promise<string> {
  // Use codeSummary if available to reduce token usage.
  const prompt = followup
    ? followupSnippetPrompt(
        userInput,
        codeSummary || selectedCode,
        previousContext
      )
    : initialSnippetPrompt(selectedCode, userInput);

  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return cleanJSONResponse(candidateText);
}

export async function generateQuizQuestions(
  selectedCode: string,
  focus: string
): Promise<QuizQuestions> {
  const prompt = quizPrompt(selectedCode, focus);
  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    return JSON.parse(cleanJSONResponse(candidateText));
  } catch (e) {
    vscode.window.showErrorMessage('Failed to parse quiz questions.');
    return [];
  }
}

export async function generateQuizFeedback(
  responses: { question: string; selectedOption: string; correct: boolean }[]
): Promise<string> {
  const responsesText = responses
    .map(
      (r, idx) =>
        `Q${idx + 1}: ${r.question}\nYour answer: ${r.selectedOption} (${r.correct ? 'Correct' : 'Incorrect'})`
    )
    .join('\n\n');

  const prompt = feedbackPrompt(responsesText);
  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return candidateText || 'No feedback provided.';
}

export async function queryLLMForQuizFeedback(
  quizResponses: {
    question: string;
    selectedOption: string;
    correct: boolean;
  }[]
): Promise<string> {
  const responsesText = quizResponses
    .map(
      (r, idx) =>
        `Q${idx + 1}: ${r.question}\nYour answer: ${r.selectedOption} (${r.correct ? 'Correct' : 'Incorrect'})`
    )
    .join('\n\n');

  const prompt = feedbackPrompt(responsesText);
  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return cleanJSONResponse(candidateText);
}

export async function generateQuizFollowupFeedback(
  responses: { question: string; selectedOption: string; correct: boolean }[],
  followupInput: string,
  selectedCode: string
): Promise<string> {
  const responsesText = responses
    .map(
      (r, idx) =>
        `Q${idx + 1}: ${r.question}\nYour answer: ${r.selectedOption} (${r.correct ? 'Correct' : 'Incorrect'})`
    )
    .join('\n\n');

  const prompt = `Below is a summary of a student's quiz responses regarding a code snippet:
---------------------
${responsesText}
---------------------
The original code snippet is:
---------------------
${selectedCode}
---------------------
The user has a follow-up question: "${followupInput}"
Please provide additional tailored clarification and insights, including a list of the quiz answers and a summary of the student's performance.
Return only plain text.`;

  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return cleanJSONResponse(candidateText);
}
