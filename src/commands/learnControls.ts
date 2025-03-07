import * as vscode from 'vscode';

import {
  generateQuizFeedback,
  generateQuizQuestions,
  generateSnippetExplanation,
  summarizeCode,
  generateQuizFollowupFeedback,
} from '../utils/llm/queryHelpers';
import {
  getQuizFeedbackHTML,
  getQuizQuestionHTML,
  getQuizFocusHTML,
  getQuizFollowupHTML,
} from '../utils/html/templates/quizTemplates';
import {
  getUnderstandInputHTML,
  getUnderstandResultWithFollowupHTML,
} from '../utils/html/templates/explainTemplates';
import { getLoadingStateHTML } from '../utils/html/templates/reusableComponents';
import { getRandomLoadingMessage } from '../utils/ui/uiHelpers';
import { updateProficiency } from '../db/proficiency/db';

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
    correctAnswer: string;
    responseTime: number;
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
      const followupHTML = getQuizFollowupHTML(newFeedback);
      panel.webview.html = followupHTML;
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
    panel.webview.html = getLoadingStateHTML('Finalizing quiz results');
    const feedback = await generateQuizFeedback(responses);
    const feedbackHtml = getQuizFeedbackHTML(feedback, null, responses);
    panel.webview.html = feedbackHtml;
    return;
  }

  const currentQuestion = questions[currentQuestionIndex] as QuizQuestion;

  const startTime = Date.now();

  panel.webview.html = getQuizQuestionHTML(currentQuestion);

  const selectedIndex = await waitForSelection(panel);

  if (selectedIndex !== undefined) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const selectedOption = currentQuestion.options[selectedIndex].label;
    const isCorrect = currentQuestion.options[selectedIndex].isCorrect;
    const correctAnswer =
      currentQuestion.options.find((opt) => opt.isCorrect)?.label || 'Unknown';

    responses.push({
      question: currentQuestion.question,
      selectedOption,
      correct: isCorrect,
      correctAnswer,
      responseTime,
    });

    const topic = currentQuestion.topic || 'General';

    updateProficiency(topic, isCorrect, responseTime);

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
