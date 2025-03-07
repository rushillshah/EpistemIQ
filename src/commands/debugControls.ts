import * as vscode from 'vscode';

import {
  queryLLMForOptions,
  queryLLMForFixSuggestion,
  generateQuizFollowupFeedback,
  generateSnippetExplanation,
  summarizeCode,
  generateQuizFeedback,
} from '../utils/llm/queryHelpers';
import {
  buildQuizHtml,
  getInitialChoiceTemplate,
  getQuizFeedbackHTML,
} from '../utils/html/templates/quizTemplates';
import { getCombinedExplanationTemplate } from '../utils/html/templates/explainTemplates';
import { getLoadingStateHTML } from '../utils/html/templates/reusableComponents';
import { getRandomLoadingMessage } from '../utils/ui/uiHelpers';
import { updateProficiency } from '../db/proficiency/db';

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const diagnosticText = diagnostic.message;
  const diagnosticSummary = await summarizeCode(diagnosticText);

  const panel = vscode.window.createWebviewPanel(
    'learnWithEpistemeQuiz',
    'Learn with EpistemIQ',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  panel.webview.onDidReceiveMessage((msg) => {
    if (msg.type === 'closePanel') {
      panel.dispose();
    }
  });

  panel.webview.html = getInitialChoiceTemplate(diagnostic.message);
  const message = await waitForMessage(panel, 'choiceSelected');
  const choice = message.choice;

  if (choice === 'understand') {
    handleUnderstandError(diagnostic, document, panel, diagnosticSummary);
    return;
  } else if (choice === 'quiz') {
    handleQuizError(diagnostic, panel, document);
  }
}

const handleUnderstandError = async (
  diagnostic: vscode.Diagnostic,
  document: vscode.TextDocument,
  panel: vscode.WebviewPanel,
  diagnosticSummary: string
) => {
  panel.webview.html = getLoadingStateHTML(
    getRandomLoadingMessage('understanding')
  );
  let currentExplanation = await queryLLMForFixSuggestion(diagnostic, document);
  panel.webview.html = getCombinedExplanationTemplate(
    currentExplanation,
    '',
    'submitFollowup'
  );
  while (true) {
    const followupMsg = await waitForMessage(panel, 'submitFollowup');
    if (!followupMsg || !followupMsg.input) break;
    const followupInput = followupMsg.input;
    panel.webview.html = getLoadingStateHTML(
      getRandomLoadingMessage('followup')
    );
    const newExplanation = await generateSnippetExplanation(
      diagnostic.message,
      followupInput,
      true,
      currentExplanation,
      diagnosticSummary
    );
    currentExplanation = newExplanation;
    panel.webview.html = getCombinedExplanationTemplate(
      currentExplanation,
      '',
      'submitFollowup'
    );
  }
  panel.dispose();
};

const handleQuizError = async (
  diagnostic: vscode.Diagnostic,
  panel: vscode.WebviewPanel,
  document: vscode.TextDocument
) => {
  panel.webview.html = getLoadingStateHTML(getRandomLoadingMessage('quiz'));
  const mainOptions = await queryLLMForOptions(diagnostic);
  if (!mainOptions || mainOptions.length === 0) {
    panel.dispose();
    return;
  }
  const currentQuestionIndex = 0;
  const responses: {
    question: string;
    selectedOption: string;
    correct: boolean;
    correctAnswer: string;
    responseTime: number;
  }[] = [];

  await showNextQuestion(
    panel,
    currentQuestionIndex,
    mainOptions,
    diagnostic,
    document,
    responses
  );
  panel.webview.onDidReceiveMessage((msg) => {
    if (msg.type === 'closePanel') {
      panel.dispose();
    }
  });
};

async function showNextQuestion(
  panel: vscode.WebviewPanel,
  currentQuestionIndex: number,
  mainOptions: Option[],
  diagnostic: vscode.Diagnostic,
  document: vscode.TextDocument,
  responses: QuizResponses
) {
  if (currentQuestionIndex >= mainOptions.length) {
    await handleTerminateQuiz(diagnostic, document, responses, panel);
    return;
  }

  const currentQuestion = mainOptions[currentQuestionIndex] as unknown as {
    question: string;
    options: { label: string; isCorrect: boolean }[];
    topic: string;
  };

  const startTime = Date.now();

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
  }

  currentQuestionIndex++;
  await showNextQuestion(
    panel,
    currentQuestionIndex,
    mainOptions,
    diagnostic,
    document,
    responses
  );
}

const handleTerminateQuiz = async (
  diagnostic: vscode.Diagnostic,
  document: vscode.TextDocument,
  responses: QuizResponses,
  panel: vscode.WebviewPanel
) => {
  panel.webview.html = getLoadingStateHTML('Finalizing quiz results');

  // ✅ Pass responses to feedback function
  const feedback = await generateQuizFeedback(responses, diagnostic.message);

  // ✅ Extract necessary data from feedback
  const {
    totalScore,
    strongTopics,
    weakTopics,
    suggestionsForImprovement,
    quizSummary,
  } = feedback;

  const explanation = await queryLLMForFixSuggestion(diagnostic, document);

  panel.webview.html = getQuizFeedbackHTML(feedback, explanation, responses);

  while (true) {
    const followupMsg = await waitForMessage(panel, 'submitQuizFollowup');
    if (!followupMsg || !followupMsg.input) break;

    const followupInput = followupMsg.input;
    panel.webview.html = getLoadingStateHTML(
      getRandomLoadingMessage('followup')
    );

    let newFeedback = await generateQuizFollowupFeedback(
      responses,
      followupInput,
      diagnostic.message
    );

    newFeedback = {
      ...newFeedback,
      totalScore: newFeedback.totalScore || totalScore,
      strongTopics: newFeedback.strongTopics?.length
        ? newFeedback.strongTopics
        : strongTopics,
      weakTopics: newFeedback.weakTopics?.length
        ? newFeedback.weakTopics
        : weakTopics,
      suggestionsForImprovement: newFeedback.suggestionsForImprovement?.length
        ? newFeedback.suggestionsForImprovement
        : suggestionsForImprovement,
      quizSummary: newFeedback.quizSummary || quizSummary,
    };

    panel.webview.html = getQuizFeedbackHTML(
      newFeedback,
      explanation,
      responses
    );
    panel.webview.postMessage({ type: 'attachToggleScript' });
  }
};
