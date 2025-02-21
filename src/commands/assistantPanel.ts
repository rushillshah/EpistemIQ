/**
 * Assistant Panel Command Module
 *
 * This module provides a function to create the LearnCode AI Assistant panel
 * as a webview within VS Code. It displays a user interface for future AI features.
 */

import * as vscode from 'vscode';

export function createAssistantPanel(context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel(
    'epistemIQEducation',
    'EpistemIQ Education',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = getAssistantWebviewContent();
}

function getAssistantWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EpistemIQ Education</title>
      </head>
      <body>
        <h1>Welcome to EpistemIQ</h1>
        <p>This is your interactive interface for guided coding decisions.</p>
        <ul>
          <li>Step-by-step guidance</li>
          <li>Interactive debugging with quizzes and tailored explanations</li>
          <li>Adaptive challenge prompts</li>
          <li>Free selection quizzes and explanations</li>
        </ul>
      </body>
    </html>
  `;
}
