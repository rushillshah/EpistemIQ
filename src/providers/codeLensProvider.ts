/**
 * Episteme Code Lens Provider Module
 *
 * This module provides a CodeLens provider that displays an inline clickable
 * "Learn with Episteme" link above the lines of code with diagnostics.
 */

import * as vscode from 'vscode';

export class EpistemeCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const lenses: vscode.CodeLens[] = [];
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    diagnostics.forEach((diagnostic) => {
      const lensRange = new vscode.Range(
        diagnostic.range.start,
        diagnostic.range.start
      );
      const command: vscode.Command = {
        command: 'epistemiq.errors',
        title: 'Debug with Episteme',
        arguments: [document, diagnostic],
      };
      lenses.push(new vscode.CodeLens(lensRange, command));
    });
    return lenses;
  }
}
