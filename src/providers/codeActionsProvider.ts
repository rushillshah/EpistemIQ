import * as vscode from 'vscode';
import { understandWithEpisteme, quizWithEpisteme } from '../commands/epistemeCommands';
import { learnWithEpisteme } from '../commands/learnWithEpisteme';


export class EpistemeCodeActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] {
    console.log("EpistemeCodeActionProvider called for range:", range);
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    console.log("Found diagnostics:", diagnostics);

    // Find a diagnostic that intersects with the provided range.
    const relevantDiagnostic = diagnostics.find(diag => range.intersection(diag.range));
    if (!relevantDiagnostic) {
      console.log("No relevant diagnostic found.");
      return [];
    }
    console.log("Relevant diagnostic found:", relevantDiagnostic);

    // Create quick fix actions.
    const understandAction = new vscode.CodeAction('Understand with Episteme', vscode.CodeActionKind.QuickFix);
    understandAction.command = {
      command: 'episteme.understand',
      title: 'Understand with Episteme',
      arguments: [document, relevantDiagnostic]
    };

    const quizAction = new vscode.CodeAction('Quiz with Episteme', vscode.CodeActionKind.QuickFix);
    quizAction.command = {
      command: 'episteme.quiz',
      title: 'Quiz with Episteme',
      arguments: [document, relevantDiagnostic]
    };

    const learnAction = new vscode.CodeAction('Debug with Episteme', vscode.CodeActionKind.QuickFix);
    learnAction.command = {
      command: 'episteme.errors',
      title: 'Debug with Episteme',
      arguments: [document, relevantDiagnostic]
    };

    return [understandAction, quizAction, learnAction];

    return [understandAction, quizAction];
  }
}