import * as vscode from 'vscode';
import { createAssistantPanel } from './commands/assistantPanel';
import { learnWithEpisteme } from './commands/debugControls';
import {
  understandWithEpisteme,
  quizWithEpisteme,
} from './commands/learnControls';
import { EpistemeCodeActionProvider } from './providers/codeActionsProvider';
import { EpistemeCodeLensProvider } from './providers/codeLensProvider';
import { registerEpistemeContentProvider } from './providers/epistemeContentProvider';

export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage('EpistemIQ is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand('epistemiq.start', () => {
      createAssistantPanel();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('epistemiq.errors', learnWithEpisteme)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'epistemiq.understand',
      understandWithEpisteme
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('epistemiq.quiz', quizWithEpisteme)
  );

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

export function deactivate(): void {}
