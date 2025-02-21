/**
 * Assistant Panel Command Module
 *
 * This module provides a function to create the LearnCode AI Assistant panel
 * as a webview within VS Code. It displays a user interface for future AI features.
 */

import * as vscode from 'vscode';

export function createAssistantPanel(context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel(
    'learnCodeAIAssistant', // Internal identifier
    'LearnCode AI Assistant', // Panel title
    vscode.ViewColumn.One, // Show in editor column one
    { enableScripts: true } // Allow scripts in the webview
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
        <title>LearnCode AI Assistant</title>
      </head>
      <body>
        <h1>Welcome to LearnCode AI Assistant</h1>
        <p>This is your interactive interface for guided coding decisions.</p>
        <ul>
          <li>Step-by-step guidance</li>
          <li>Interactive debugging</li>
          <li>Incremental autocomplete with reasoning</li>
          <li>Adaptive challenge prompts</li>
          <li>Help cooldown system</li>
        </ul>
      </body>
    </html>
  `;
}
