import * as vscode from 'vscode';
import { createAssistantPanel } from './commands/assistantPanel';
import { learnWithEpisteme } from './commands/learnWithEpisteme';
import { understandWithEpisteme, quizWithEpisteme } from './commands/epistemeCommands';
import { EpistemeCodeActionProvider } from './providers/codeActionsProvider';
import { EpistemeCodeLensProvider } from './providers/codeLensProvider';
import { registerEpistemeContentProvider } from './providers/epistemeContentProvider';

export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage('EpistemIQ is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand('episteme.start', () => {
      createAssistantPanel(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('episteme.errors', learnWithEpisteme)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('episteme.understand', understandWithEpisteme)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('episteme.quiz', quizWithEpisteme)
  );

  // Register Code Actions Provider so quick fixes appear (e.g., in the error lightbulb).
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file' },
      new EpistemeCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  // Register CodeLens Provider so inline links (e.g., "Learn with Episteme" or "Quiz with Episteme")
  // appear above lines with diagnostics.
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: 'file' },
      new EpistemeCodeLensProvider()
    )
  );

  // Register any additional content providers.
  context.subscriptions.push(registerEpistemeContentProvider());
}

export function deactivate(): void {
  // Cleanup if necessary.
}