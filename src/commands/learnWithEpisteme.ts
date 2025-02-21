import * as vscode from 'vscode';
import {
  queryLLMForOptions,
  queryLLMForFixSuggestion,
  queryLLMForFollowupQuestions,
  getBlockSnippetRange,
  applyMinimalPatch,
} from '../utils/queryHelpers';
import {
  LOADING_TEMPLATE,
  FIX_SUGGESTION_TEMPLATE,
  SUCCESS_TEMPLATE,
  REJECT_TEMPLATE,
  buildQuizHtml,
  buildFollowupHtml,
  showLoadingState,
} from '../utils/templates';

/**
 * Updates the panel with a loading state.
 * @param panel The webview panel.
 * @param message The loading message.
 */

function waitForSelection(
  panel: vscode.WebviewPanel
): Promise<number | undefined> {
  return new Promise((resolve) => {
    const subscription = panel.webview.onDidReceiveMessage((message) => {
      if (message.type === 'optionSelected') {
        resolve(message.index);
        subscription.dispose();
      }
    });
  });
}

/**
 * Interactive workflow using a single webview panel.
 * - Displays the main question and waits for the user’s selection.
 * - If incorrect, repeatedly asks follow-up questions until one is answered correctly.
 * - After a correct follow-up answer, re-queries the main question (optionally with additional context).
 */
export async function learnWithEpisteme(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): Promise<void> {
  const panel = vscode.window.createWebviewPanel(
    'learnWithEpistemeQuiz',
    'Learn with Episteme Quiz',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  let mainOptions = await queryLLMForOptions(diagnostic);
  if (mainOptions.length === 0) {
    panel.dispose();
    return;
  }

  while (true) {
    panel.webview.html = buildQuizHtml(
      mainOptions.map((opt) => ({
        label: opt.label,
        isCorrect: opt.isCorrect,
      })),
      diagnostic.message
    );
    const mainSelection = await waitForSelection(panel);
    if (mainSelection === undefined) {
      panel.dispose();
      return;
    }

    if (mainOptions[mainSelection].isCorrect) {
      const fixSuggestion = await queryLLMForFixSuggestion(
        diagnostic,
        document
      );
      panel.webview.html = FIX_SUGGESTION_TEMPLATE(fixSuggestion);

      const fixChoice = await waitForSelection(panel);
      if (fixChoice === 0) {
        const blockRange = getBlockSnippetRange(document, diagnostic);
        const success = await applyMinimalPatch(
          document,
          blockRange,
          fixSuggestion
        );
        panel.webview.html = SUCCESS_TEMPLATE;
      } else {
        panel.webview.html = REJECT_TEMPLATE;
      }
      setTimeout(() => panel.dispose(), 3000);
      return;
    } else {
      showLoadingState(panel, 'Building your personalized learning plan...');

      let followupCorrect = false;
      while (!followupCorrect) {
        const followupQuestions =
          await queryLLMForFollowupQuestions(diagnostic);
        if (followupQuestions.length === 0) {
          break;
        }
        for (const followup of followupQuestions) {
          panel.webview.html = buildFollowupHtml(followup);
          const followupSelection = await waitForSelection(panel);
          if (
            followupSelection !== undefined &&
            followup.options[followupSelection].isCorrect
          ) {
            followupCorrect = true;
            break;
          }
        }
        if (!followupCorrect) {
          showLoadingState(
            panel,
            'Building your personalized learning plan...'
          );
        }
      }
      mainOptions = await queryLLMForOptions(diagnostic);
    }
  }
}
