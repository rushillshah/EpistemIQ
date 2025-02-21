import * as vscode from 'vscode';

import {
  queryLLMForOptions,
  queryLLMForFixSuggestion,
  queryLLMForQuizFeedback,
} from '../utils/queryHelpers';
import {
  getCombinedExplanationTemplate,
  buildQuizHtml,
  getInitialChoiceTemplate,
} from '../utils/templates';

function waitForMessage(
  panel: vscode.WebviewPanel,
  expectedType: string
): Promise<any> {
  return new Promise((resolve) => {
    const subscription = panel.webview.onDidReceiveMessage((message) => {
      if (message.type === expectedType) {
        resolve(message);
        subscription.dispose();
      }
    });
  });
}

export async function learnWithEpisteme(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): Promise<void> {
  const panel = vscode.window.createWebviewPanel(
    'learnWithEpistemeQuiz',
    'Learn with Episteme',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  panel.webview.html = getInitialChoiceTemplate(diagnostic.message);

  const message = await waitForMessage(panel, 'choiceSelected');
  const choice = message.choice;
  console.log('User selected:', choice);

  if (choice === 'understand') {
    const explanation = await queryLLMForFixSuggestion(diagnostic, document);
    panel.webview.html = getCombinedExplanationTemplate(explanation, '');
    await waitForMessage(panel, 'closePanel');
    panel.dispose();
    return;
  } else if (choice === 'quiz') {
    let mainOptions = await queryLLMForOptions(diagnostic);
    if (mainOptions.length === 0) {
      panel.dispose();
      return;
    }
    let currentQuestionIndex = 0;
    let correctCount = 0;
    const totalQuestions = mainOptions.length;
    const responses: {
      question: string;
      selectedOption: string;
      correct: boolean;
    }[] = [];

    async function showNextQuestion(): Promise<void> {
      if (currentQuestionIndex >= totalQuestions) {
        const feedback = await queryLLMForQuizFeedback(responses);
        const explanation = await queryLLMForFixSuggestion(
          diagnostic,
          document
        );
        panel.webview.html = getCombinedExplanationTemplate(
          explanation,
          feedback
        );
        return;
      }
      const currentQuestion = mainOptions[currentQuestionIndex] as unknown as {
        question: string;
        options: { label: string; isCorrect: boolean }[];
      };
      panel.webview.html = buildQuizHtml(
        currentQuestion.options.map((opt) => ({
          label: opt.label,
          isCorrect: opt.isCorrect,
        })),
        currentQuestion.question
      );
      const selectionMsg = await waitForMessage(panel, 'optionSelected');
      const selectedIndex =
        typeof selectionMsg === 'object' && selectionMsg.index !== undefined
          ? selectionMsg.index
          : selectionMsg;
      if (
        selectedIndex !== undefined &&
        currentQuestion.options[selectedIndex].isCorrect
      ) {
        correctCount++;
        responses.push({
          question: currentQuestion.question,
          selectedOption: currentQuestion.options[selectedIndex].label,
          correct: true,
        });
      } else {
        responses.push({
          question: currentQuestion.question,
          selectedOption:
            currentQuestion.options[selectedIndex]?.label || 'none',
          correct: false,
        });
      }
      currentQuestionIndex++;
      await showNextQuestion();
    }

    await showNextQuestion();
    await waitForMessage(panel, 'closePanel');
    panel.dispose();
    return;
  }
}
