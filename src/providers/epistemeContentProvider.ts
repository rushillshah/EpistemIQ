/**
 * Episteme Content Provider Module
 *
 * This module registers a custom text document content provider for the "episteme"
 * URI scheme. It supplies the content displayed in the inline peek view for
 * "Learn with Episteme" actions.
 */

import * as vscode from 'vscode';

export function registerEpistemeContentProvider(): vscode.Disposable {
  return vscode.workspace.registerTextDocumentContentProvider('episteme', {
    provideTextDocumentContent(uri: vscode.Uri): string {
      const query = new URLSearchParams(uri.query);
      const message = query.get('message') || 'No explanation available.';
      return `**Explanation:**\n\n${message}`;
    },
  });
}
