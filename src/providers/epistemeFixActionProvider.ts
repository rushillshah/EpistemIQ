import * as vscode from 'vscode';

// This provider always returns a "Learn with Episteme" quick fix action
export class EpistemeFixActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] {
    // Get diagnostics for the document
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    // If there are no diagnostics, return an empty array.
    if (diagnostics.length === 0) {
      return [];
    }
    
    // Create a quick fix action that calls the "learnCodeAI.learnWithEpisteme" command.
    // (You can optionally narrow this down to diagnostics that intersect 'range' if needed.)
    const action = new vscode.CodeAction('Learn with Episteme', vscode.CodeActionKind.QuickFix);
    action.command = {
      command: 'learnCodeAI.learnWithEpisteme',
      title: 'Learn with Episteme',
      arguments: [document, diagnostics[0]] // Pass the document and first diagnostic as arguments.
    };
    return [action];
  }
}