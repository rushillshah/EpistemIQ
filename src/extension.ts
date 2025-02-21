/**
 * Entry Point for LearnCode AI Extension
 *
 * This file is the main entry point for the LearnCode AI VS Code extension.
 * It handles activation, command registration, and registration of code action,
 * code lens, and content providers.
 */

import * as vscode from 'vscode';
import { createAssistantPanel } from './commands/assistantPanel';
import { learnWithEpisteme } from './commands/learnWithEpisteme';
import { EpistemeCodeActionProvider } from './providers/codeActionsProvider';
import { EpistemeCodeLensProvider } from './providers/codeLensProvider';
import { registerEpistemeContentProvider } from './providers/epistemeContentProvider';

export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage('LearnCode AI is now active!');

  const startDisposable = vscode.commands.registerCommand(
    'learnCodeAI.start',
    () => {
      createAssistantPanel(context);
    }
  );
  context.subscriptions.push(startDisposable);

  const learnDisposable = vscode.commands.registerCommand(
    'learnCodeAI.learnWithEpisteme',
    learnWithEpisteme
  );
  context.subscriptions.push(learnDisposable);

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file' },
      new EpistemeCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: 'file' },
      new EpistemeCodeLensProvider()
    )
  );

  context.subscriptions.push(registerEpistemeContentProvider());
}

export function deactivate(): void {
  // Cleanup if necessary.
}
