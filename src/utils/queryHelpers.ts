import * as vscode from 'vscode';
import * as Diff from 'diff';

import { LLM_API_URL } from '../config';
import { initialQuestionPrompt, followupQuestionPrompt } from './prompts';

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
  const prompt = initialQuestionPrompt(diagnostic);

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

  const prompt = `Given the following code snippet:
  ${fullFileContent}
  and the diagnostic error: "${diagnostic.message}",
  provide the corrected explanation for the entire block that needs fixing. Don't include any code block indicators, but provide plaintext code snippets, separated from the text with a line of '-'. Provide a concise, short explanation and the suggested change, depending on the user's understanding based on the quiz responses`;

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

export async function queryLLMForFollowupQuestions(
  diagnostic: vscode.Diagnostic
): Promise<FollowupQuestion[]> {
  const prompt = followupQuestionPrompt(diagnostic);

  const data = await callLLM(prompt);
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    vscode.window.showErrorMessage(
      'LLM API did not return candidate text for follow-up questions.'
    );
    return [];
  }
  try {
    const followupQuestions = JSON.parse(
      cleanJSONResponse(candidateText)
    ) as FollowupQuestion[];
    return followupQuestions;
  } catch (e) {
    vscode.window.showErrorMessage(
      'Failed to parse follow-up questions from candidate text.'
    );
    return [];
  }
}

export async function generateSnippetExplanation(selectedCode: string, userInput: string): Promise<string> {
    const prompt = `Below is a code snippet:
  ---------------------
  ${selectedCode}
  ---------------------
  The user indicates that the following aspects are unclear:
  "${userInput}"
  Please provide a detailed explanation covering:
  - What the code does,
  - The overall idea of the function,
  - Its time and space complexity,
  - Possible improvements.
  Return the explanation in plain text only.`;
    
    const data = await callLLM(prompt);
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation provided.";
    return explanation;
  }
  
export async function generateQuizQuestions(selectedCode: string, focus: string): Promise<any[]> {
    const prompt = `Below is a code snippet:
  ---------------------
  ${selectedCode}
  ---------------------
  Based on the code above, generate 5 to 7 unique quiz questions that test understanding.
  Each question must include multiple-choice answers.
  Focus on ${focus}.
  Return the questions as a JSON array in the following format:
  [
    {
      "question": "Question text",
      "options": [
        {"label": "Option 1", "isCorrect": false},
        {"label": "Option 2", "isCorrect": true},
        {"label": "Option 3", "isCorrect": false},
        {"label": "Option 4", "isCorrect": false}
      ]
    },
    ...
  ]
  `;
    const data = await callLLM(prompt);
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    try {
      return JSON.parse(cleanJSONResponse(candidateText));
    } catch (e) {
      vscode.window.showErrorMessage("Failed to parse quiz questions.");
      return [];
    }
  }

  export async function generateQuizFeedback(responses: { question: string; selectedOption: string; correct: boolean }[]): Promise<string> {
    const responsesText = responses.map((r, idx) =>
      `Q${idx + 1}: ${r.question}\nYour answer: ${r.selectedOption} (${r.correct ? "Correct" : "Incorrect"})`
    ).join('\n\n');
  
    const prompt = `Below are a student's responses to a quiz:
    ---------------------
    ${responsesText}
    ---------------------
    Please provide a detailed analysis of the student's understanding of the code.
    Highlight key areas where the student is struggling and suggest improvements.
    Return your feedback in plain text, keep it short and target concrete points instead of waxing on in explanation. At the end, provide a summary, and a line or two about what they should work on next, with directions to articles and documentation relevant to that area`;
    
        const data = await callLLM(prompt);
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return candidateText || "No feedback provided.";
  }