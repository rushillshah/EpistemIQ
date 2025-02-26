import * as vscode from 'vscode';

import {
  generateQuizFeedback,
  generateQuizQuestions,
  generateSnippetExplanation,
  summarizeCode,
  generateQuizFollowupFeedback,
} from '../utils/queryHelpers';
import {
  getQuizFeedbackHTML,
  getUnderstandInputHTML,
  getUnderstandResultWithFollowupHTML,
  getQuizQuestionHTML,
  getQuizFocusHTML,
  getLoadingStateHTML,
} from '../utils/html/templates';
import { getRandomLoadingMessage } from '../utils/uiHelpers';

export async function understandWithEpisteme(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    vscode.window.showInformationMessage(
      'Please select some code to understand.'
    );
    return;
  }
  const selectedCode = editor.document.getText(editor.selection);
  if (!selectedCode) {
    vscode.window.showInformationMessage(
      'Please select some code to understand.'
    );
    return;
  }

  const codeSummary = await summarizeCode(selectedCode);

  const panel = vscode.window.createWebviewPanel(
    'epistemeUnderstand',
    'Understand with EpistemIQ',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  panel.webview.html = getUnderstandInputHTML(selectedCode);

  let currentExplanation = '';
  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.type === 'submitUnderstanding') {
      const userInput = message.input;
      panel.webview.html = getLoadingStateHTML(
        getRandomLoadingMessage('understanding')
      );
      const explanation = await generateSnippetExplanation(
        selectedCode,
        userInput,
        false
      );
      currentExplanation = explanation;
      panel.webview.html = getUnderstandResultWithFollowupHTML(explanation);
    } else if (message.type === 'submitFollowup') {
      const followupInput = message.input;
      panel.webview.html = getLoadingStateHTML(
        getRandomLoadingMessage('understanding')
      );
      const newExplanation = await generateSnippetExplanation(
        selectedCode,
        followupInput,
        true,
        currentExplanation,
        codeSummary
      );
      currentExplanation = newExplanation;
      panel.webview.html = getUnderstandResultWithFollowupHTML(newExplanation);
    } else if (message.type === 'closePanel') {
      panel.dispose();
    }
  });
}
function waitForQuizFocus(
  panel: vscode.WebviewPanel
): Promise<string | undefined> {
  return new Promise((resolve) => {
    const subscription = panel.webview.onDidReceiveMessage((message) => {
      if (message.type === 'quizFocus') {
        resolve(message.focus);
        subscription.dispose();
      }
    });
  });
}

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

export async function quizWithEpisteme(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    vscode.window.showInformationMessage('Please select some code to quiz on.');
    return;
  }
  const selectedCode = editor.document.getText(editor.selection);

  const panel = vscode.window.createWebviewPanel(
    'epistemeQuiz',
    'Quiz with EpistemIQ',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  const quizFocusHTML = getQuizFocusHTML(selectedCode);
  panel.webview.html = quizFocusHTML;
  const focus = await waitForQuizFocus(panel);
  if (!focus) {
    panel.dispose();
    return;
  }
  panel.webview.html = getLoadingStateHTML(getRandomLoadingMessage('quiz'));
  const questions = await generateQuizQuestions(selectedCode, focus);
  if (!questions || questions.length === 0) {
    panel.dispose();
    return;
  }

  const currentQuestionIndex = 0;
  const correctCount = 0;
  const totalQuestions = questions.length;
  const responses: {
    question: string;
    selectedOption: string;
    correct: boolean;
  }[] = [];

  await showNextQuestion(
    panel,
    responses,
    questions,
    currentQuestionIndex,
    totalQuestions,
    correctCount
  );

  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.type === 'submitQuizFollowup') {
      const followupInput = message.input;
      panel.webview.html = getLoadingStateHTML(
        getRandomLoadingMessage('followup')
      );
      const newFeedback = await generateQuizFollowupFeedback(
        responses,
        followupInput,
        selectedCode
      );
      panel.webview.html = getQuizFeedbackHTML(newFeedback);
    } else if (message.type === 'closePanel') {
      panel.dispose();
    }
  });
}

async function showNextQuestion(
  panel: vscode.WebviewPanel,
  responses: QuizResponses,
  questions: QuizQuestions,
  currentQuestionIndex: number,
  totalQuestions: number,
  correctCount: number
): Promise<void> {
  if (currentQuestionIndex >= totalQuestions) {
    panel.webview.html = getLoadingStateHTML('Finalizing quiz results...');
    const feedback = await generateQuizFeedback(responses);
    const feedbackhtml = getQuizFeedbackHTML(
      feedback as unknown as FeedbackResponse
    );
    console.log('feedback', feedbackhtml);
    panel.webview.html = feedbackhtml;
    return;
  }
  const currentQuestion = questions[currentQuestionIndex] as {
    question: string;
    options: { label: string; isCorrect: boolean }[];
  };
  panel.webview.html = getQuizQuestionHTML(currentQuestion);
  const selection = await waitForSelection(panel);
  if (selection !== undefined) {
    const selectedOption = currentQuestion.options[selection].label;
    const isCorrect = currentQuestion.options[selection].isCorrect;
    responses.push({
      question: currentQuestion.question,
      selectedOption,
      correct: isCorrect,
    });
    if (isCorrect) {
      correctCount++;
    }
  }
  currentQuestionIndex++;
  await showNextQuestion(
    panel,
    responses,
    questions,
    currentQuestionIndex,
    totalQuestions,
    correctCount
  );
}
