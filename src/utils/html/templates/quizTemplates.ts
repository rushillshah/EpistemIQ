import { renderOptions, getVscodeApiScript, htmlDocument } from '../utils';
import { getScoreRingHTML, getFollowupSection } from './reusableComponents';

import { formatLLMResponse } from '../../ui/uiHelpers';

export function buildQuizHtml(
  options: { label: string; isCorrect: boolean }[],
  diagnosticMessage: string
): string {
  const formattedDiagnostic = formatLLMResponse(diagnosticMessage);
  const optionsHtml = renderOptions(options, 'selectOption');

  const bodyContent = `
    <h3>Issue</h3>
    <pre id="diagnostic"></pre>
    <p>Select the most likely cause of the error:</p>
    <div id="options">
      ${optionsHtml}
    </div>
    <script>
      ${getVscodeApiScript()}

      document.getElementById("diagnostic").innerText = ${JSON.stringify(formattedDiagnostic)};

      function selectOption(index) {
        vscode.postMessage({ type: 'optionSelected', index });
      }
    </script>
  `;
  return htmlDocument(bodyContent);
}

export function getQuizFocusHTML(code: string): string {
  const formattedCode = formatLLMResponse(code);
  const bodyContent = `
    <div class="quiz-focus-container">
      <h3>Quiz Focus</h3>
      <pre id="codeBlock"></pre>
    </div>

    <div class="fixed-input-container">
      <p>Enter the quiz focus (e.g. General, Complexity, Logic, Best Practices):</p>
      <div class="input-wrapper">
        <input id="quizFocusInput" type="text" placeholder="e.g. General" />
        <button onclick="submitFocus()" class="send-button">➤</button>
      </div>
    </div>

    <script>
      document.getElementById("codeBlock").textContent = ${JSON.stringify(formattedCode)};
      ${getVscodeApiScript()}
      
      function submitFocus() {
        const focus = document.getElementById("quizFocusInput").value.trim();
        if (!focus) return;
        vscode.postMessage({ type: 'quizFocus', focus });
        document.getElementById("quizFocusInput").value = "";
      }

      document.getElementById("quizFocusInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submitFocus();
        }
      });
    </script>
  `;
  return htmlDocument(bodyContent);
}

export function getQuizQuestionHTML(questionObj: {
  question: string;
  options: { label: string; isCorrect: boolean }[];
}): string {
  const formattedQuestion = formatLLMResponse(questionObj.question);
  const optionsHtml = renderOptions(questionObj.options, 'selectOption');
  const bodyContent = `
    <h3>Quiz Question</h3>
    <pre id="questionBlock"></pre>
    <div id="options">
      ${optionsHtml}
    </div>
    <script>
      document.getElementById("questionBlock").textContent = ${JSON.stringify(formattedQuestion)};
      ${getVscodeApiScript()}
      function selectOption(index) {
        vscode.postMessage({ type: 'optionSelected', index: index });
      }
    </script>
  `;
  return htmlDocument(bodyContent);
}

export function getInitialChoiceTemplate(errorMessage: string): string {
  const formattedError = formatLLMResponse(errorMessage);
  const bodyContent = `
    <h3>Diagnostic: ${formattedError}</h3>
    <p>Select an option to learn more:</p>
    <button onclick="selectChoice('understand')">Understand</button>
    <button onclick="selectChoice('quiz')">Quiz</button>
    <script>
      ${getVscodeApiScript()}
      function selectChoice(choice) {
        vscode.postMessage({ type: 'choiceSelected', choice });
      }
    </script>
  `;
  return htmlDocument(bodyContent, false);
}

export function getQuizFeedbackHeader(
  quizSummary: string,
  percentage: number,
  scoreColorClass: string,
  collapsed: boolean
): string {
  const arrowDirection = collapsed ? '▼' : '▲';

  return `
    <div class="feedback-header" onclick="toggleCollapsible()">
      <div class="feedback-header-content">
        <div class="feedback-summary">
          <h2>${quizSummary}</h2>
        </div>
        ${getScoreRingHTML(percentage, scoreColorClass)}
      </div>
      <span id="toggle-arrow" class="arrow-icon">${arrowDirection}</span>
    </div>
  `;
}

function getCollapsibleScript(isExpanded: boolean): string {
  return `
    <script>
      function toggleCollapsible() {
        const content = document.getElementById("collapsible-content");
        const arrow = document.getElementById("toggle-arrow");

        if (content.style.maxHeight) {
          content.style.maxHeight = null;
          arrow.style.transform = "rotate(0deg)";
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
          arrow.style.transform = "rotate(180deg)";
        }
      }

      document.addEventListener("DOMContentLoaded", () => {
        const content = document.getElementById("collapsible-content");
        if (${isExpanded}) {
          content.style.maxHeight = content.scrollHeight + "px"; 
        }
      });
    </script>
  `;
}

function formatQuizData(
  totalScore: string,
  strongTopics: Record<string, string>,
  weakTopics: Record<string, string>,
  suggestionsForImprovement: string[]
) {
  const [score, total] = totalScore.split('/').map(Number);
  const percentage = total > 0 ? (score / total) * 100 : 0;
  const scoreColorClass =
    percentage < 50
      ? 'score-red'
      : percentage < 65
        ? 'score-orange'
        : percentage < 85
          ? 'score-yellow'
          : 'score-green';

  const strongTopicsHtml = Object.keys(strongTopics).length
    ? Object.entries(strongTopics)
        .map(
          ([topic, reason]) => `
          <div class="topic strong-topic">
            <span class="topic-name">${topic}</span>
            <p class="topic-explanation hidden">${reason}</p>
          </div>
        `
        )
        .join('')
    : '<div><p>No strong topics identified.</p></div>';

  const weakTopicsHtml = Object.keys(weakTopics).length
    ? Object.entries(weakTopics)
        .map(
          ([topic, reason]) => `
          <div class="topic weak-topic">
            <span class="topic-name">${topic}</span>
            <p class="topic-explanation hidden">${reason}</p>
          </div>
        `
        )
        .join('')
    : '<div><p>No weak topics identified.</p></div>';

  const suggestionsHtml = suggestionsForImprovement.length
    ? suggestionsForImprovement
        .map((suggestion) => `<li><div>${suggestion}</div></li>`)
        .join('')
    : '';

  return {
    percentage,
    scoreColorClass,
    strongTopicsHtml,
    weakTopicsHtml,
    suggestionsHtml,
  };
}

export function getQuizFollowupHTML(followupFeedback: QuizFollowup) {
  let parsedClarification = formatLLMResponse(followupFeedback.clarification);
  parsedClarification = parsedClarification.replace(/\n/g, '\n\n');

  const { totalScore, strongTopics, weakTopics, suggestionsForImprovement } =
    followupFeedback;

  const bodyContent = `
    ${generateQuizResultsHTML('Quiz Results', totalScore, strongTopics, weakTopics, suggestionsForImprovement, null as unknown as QuizResponses, false)}
    <section class="clarification-section">
      <h3>Clarification</h3>
      <div class="content clarification-container" id="clarificationBlock">
        <p>${parsedClarification}</p>
      </div>
    </section>
    ${getFollowupSection('submitQuizFollowup')}
    ${getCollapsibleScript(false)}
  `;

  return htmlDocument(bodyContent);
}

export function getQuizFeedbackHTML(
  feedback: FeedbackResponse,
  explanation: string | null = null,
  responses: QuizResponses
): string {
  const {
    quizSummary,
    totalScore,
    strongTopics,
    weakTopics,
    suggestionsForImprovement,
    clarification,
  } = feedback;

  const clarificationHtml = clarification
    ? `<div class="content clarification-container">
        <h3>Clarification</h3>
        <pre id="clarificationBlock" class="clarification-text"></pre>
        <script>document.getElementById("clarificationBlock").textContent = ${JSON.stringify(clarification)};</script>
      </div>`
    : '';

  const quizResultsHtml = generateQuizResultsHTML(
    quizSummary,
    totalScore,
    strongTopics,
    weakTopics,
    explanation ? [] : suggestionsForImprovement,
    responses,
    true,
    explanation
  );

  const bodyContent = `
    ${quizResultsHtml}
    ${clarificationHtml}
    ${getFollowupSection('submitQuizFollowup')}
    ${getCollapsibleScript(true)}
  `;

  return htmlDocument(bodyContent, false);
}

function generateQuizResultsHTML(
  quizTitle: string,
  totalScore: string,
  strongTopics: Record<string, string>,
  weakTopics: Record<string, string>,
  suggestionsForImprovement: string[],
  responses: QuizResponses,
  isExpanded: boolean,
  explanation?: string | null
): string {
  const {
    percentage,
    scoreColorClass,
    strongTopicsHtml,
    weakTopicsHtml,
    suggestionsHtml,
  } = formatQuizData(
    totalScore,
    strongTopics,
    weakTopics,
    suggestionsForImprovement
  );

  const explanationOrSuggestionsHtml = explanation
    ? `<div class="content">
        <h3>Explanation</h3>
        <pre id="explanationBlock"></pre>
        <script>document.getElementById("explanationBlock").innerHTML = ${JSON.stringify(explanation)};</script>
      </div>`
    : `<div class="content suggestions-container">
        <h3>Suggestions for Improvement</h3>
        <ul class="suggestions">${suggestionsHtml}</ul>
      </div>`;

  return `
    <div class="feedback-container">
      ${getQuizFeedbackHeader(quizTitle, percentage, scoreColorClass, !isExpanded)}
      <div id="collapsible-content" class="collapsible ${isExpanded ? 'expanded' : 'collapsed'}">
        <div class="feedback-section">
          <div class="content topics-container">
            <h3>Strong Topics</h3>
            <div class="topics">${strongTopicsHtml}</div>
          </div>
          <div class="content topics-container">
            <h3>Weak Topics</h3>
            <div class="topics">${weakTopicsHtml}</div>
          </div>
        </div>
        ${explanationOrSuggestionsHtml} <!-- This dynamically shows Explanation OR Suggestions -->
      </div>
      ${generateQuizReviewHTML(responses)}
    </div>
  `;
}

function generateQuizReviewHTML(responses: QuizResponses): string {
  if (!responses) return '';

  return `
    <div class="content quiz-review-container">
      <h3>Quiz Review</h3>
      <ul class="quiz-review">
        ${responses
          .map(
            ({ question, selectedOption, correct, correctAnswer }) => `
          <li class="quiz-review-item">
            <div class="question-text">${question}</div>
            <div class="answer-section">
              ${
                correct
                  ? `<div class="answer correct-answer">✅ <strong>Your Answer:</strong> ${selectedOption}</div>`
                  : `<div class="answer incorrect-answer">❌ <strong>Your Answer:</strong> ${selectedOption}</div>
                     <div class="answer correct-answer">✔ <strong>Correct Answer:</strong> ${correctAnswer}</div>`
              }
            </div>
          </li>
        `
          )
          .join('')}
      </ul>
    </div>
  `;
}
