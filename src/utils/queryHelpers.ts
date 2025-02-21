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
  const blockSnippet = getBlockSnippet(document, diagnostic);

  const prompt = `Given the following code snippet:
  ${blockSnippet}
  and the diagnostic error: "${diagnostic.message}",
  provide the corrected code for the entire block that needs fixing.
  Return only the corrected code (no extra commentary).`;

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

function getBlockSnippet(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): string {
  let startLine = diagnostic.range.start.line;
  let endLine = diagnostic.range.end.line;

  // Look upward for a block start indicator.
  while (
    startLine > 0 &&
    !document.lineAt(startLine).text.match(/(%\{\s*|\{\s*)/)
  ) {
    startLine--;
  }
  // Look downward for a block end indicator.
  while (
    endLine < document.lineCount - 1 &&
    !document.lineAt(endLine).text.includes('}')
  ) {
    endLine++;
  }

  let snippet = '';
  for (let i = startLine; i <= endLine; i++) {
    snippet += document.lineAt(i).text + '\n';
  }
  return snippet.trim();
}

export function getBlockSnippetRange(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.Range {
  let startLine = diagnostic.range.start.line;
  let endLine = diagnostic.range.end.line;

  while (
    startLine > 0 &&
    !document.lineAt(startLine).text.match(/(%\{\s*|\{\s*)/)
  ) {
    startLine--;
  }
  while (
    endLine < document.lineCount - 1 &&
    !document.lineAt(endLine).text.includes('}')
  ) {
    endLine++;
  }

  return new vscode.Range(
    startLine,
    0,
    endLine,
    document.lineAt(endLine).range.end.character
  );
}

export async function applyMinimalPatch(
  document: vscode.TextDocument,
  blockRange: vscode.Range,
  fixedBlock: string
): Promise<boolean> {
  const originalBlock = document.getText(blockRange);
  // Compute a line-by-line diff.
  const diff = Diff.diffLines(originalBlock, fixedBlock);

  // Reconstruct the new block using unchanged and added parts.
  let patchedBlock = '';
  diff.forEach((part) => {
    if (!part.removed) {
      patchedBlock += part.value;
    }
  });

  const edit = new vscode.WorkspaceEdit();
  edit.replace(document.uri, blockRange, patchedBlock.trim());
  return await vscode.workspace.applyEdit(edit);
}
