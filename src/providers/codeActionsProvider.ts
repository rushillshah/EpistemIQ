import * as vscode from 'vscode';

export class EpistemeCodeActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction[] {
    const diagnostics = vscode.languages.getDiagnostics(document.uri);

    const relevantDiagnostic = diagnostics.find((diag) =>
      range.intersection(diag.range)
    );
    if (!relevantDiagnostic) {
      return [];
    }
    const learnAction = new vscode.CodeAction(
      'Debug with Episteme',
      vscode.CodeActionKind.QuickFix
    );
    learnAction.command = {
      command: 'epistemiq.errors',
      title: 'Debug with Episteme',
      arguments: [document, relevantDiagnostic],
    };

    return [learnAction];
  }
}
