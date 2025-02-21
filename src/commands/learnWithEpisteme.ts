import * as vscode from 'vscode';
import {
  queryLLMForOptions,
  queryLLMForFixSuggestion,
  queryLLMForFollowupQuestions,
} from '../utils/queryHelpers';
import {
  EXPLANATION_TEMPLATE, // New template for explanation-only feedback.
  buildQuizHtml,
  buildFollowupHtml,
  showLoadingState,
} from '../utils/templates';

/**
 * Helper: Wait for a selection from the webview panel.
 */
function waitForSelection(
  panel: vscode.WebviewPanel
): Promise<number | undefined> {
  return new Promise((resolve) => {
    const subscription = panel.webview.onDidReceiveMessage((message) => {
      if (message.type === 'optionSelected') {
        resolve(message.index);
        subscription.dispose();
      } else if (message.type === 'closePanel') {
        resolve(undefined);
        subscription.dispose();
        panel.dispose();
      }
    });
  });
}

/**
 * Main interactive workflow for the diagnostic quiz.
 * Instead of applying a fix, the flow now provides feedback and an explanation.
 */
export async function learnWithEpisteme(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): Promise<void> {
  const panel = vscode.window.createWebviewPanel(
    'debugnWithEpistemeQuiz',
    'Debug with Episteme Quiz',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  let mainOptions = await queryLLMForOptions(diagnostic);
  if (mainOptions.length === 0) {
    panel.dispose();
    return;
  }

  while (true) {
    // Show the main quiz (focused on the diagnostic error).
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
      // Correct answer: Instead of applying a patch, we ask the LLM for an explanation.
      const fixExplanation = await queryLLMForFixSuggestion(diagnostic, document);
      // Display the explanation (educational feedback) in the side panel.
      panel.webview.html = EXPLANATION_TEMPLATE(fixExplanation);
      // Optionally, you can wait for a user action (like "Close") here.
      setTimeout(() => panel.dispose(), 5000);
      return;
    } else {
      // Incorrect answer: Show loading and then ask follow-up questions.
      showLoadingState(panel, 'Building your personalized learning plan...');
      let followupCorrect = false;
      while (!followupCorrect) {
        const followupQuestions = await queryLLMForFollowupQuestions(diagnostic);
        if (followupQuestions.length === 0) break;
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
          showLoadingState(panel, 'Building your personalized learning plan...');
        }
      }
      // Re-query main options (optionally, you can include context from follow-ups).
      mainOptions = await queryLLMForOptions(diagnostic);
    }
  }
}