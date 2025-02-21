import * as vscode from 'vscode';

import {
  optionsPrompt,
  followupQuestionPrompt,
  fixPrompt,
  snippetPrompt,
  quizPrompt,
  feedbackPrompt,
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

export async function generateSnippetExplanation(
  selectedCode: string,
  userInput: string
): Promise<string> {
  const prompt = snippetPrompt(selectedCode, userInput);

  const data = await callLLM(prompt);
  const explanation =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No explanation provided.';
  return explanation;
}

export async function generateQuizQuestions(
  selectedCode: string,
  focus: string
): Promise<any[]> {
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
