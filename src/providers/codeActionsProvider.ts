/**
 * Episteme Code Action Provider Module
 *
 * This module provides a CodeAction provider that adds a "Learn with Episteme"
 * quick fix option in the lightbulb (quick fix) suggestions for any diagnostic.
 */

import * as vscode from 'vscode';

export class EpistemeCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    return context.diagnostics.map((diagnostic) => {
      const action = new vscode.CodeAction(
        'Learn with Episteme',
        vscode.CodeActionKind.QuickFix
      );
      action.command = {
        command: 'learnCodeAI.learnWithEpisteme',
        title: 'Learn with Episteme',
        arguments: [document, diagnostic],
      };
      action.diagnostics = [diagnostic];
      return action;
    });
  }
}
