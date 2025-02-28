export function getCommonStyles(): string {
  return `
      <style>
        ${getBaseStyles()}
        ${getTextStyles()}
        ${getButtonStyles()}
        ${getFormStyles()}
        ${getLoadingStyles()}
        ${getQuizStyles()}
        ${getToggleArrowStyles()}
        ${getFeedbackContainerStyles()}
        ${getQuizFollowupStyles()}
        ${getQuizResultsStyles()}
        ${getScoreRingStyles()}
        ${getFeedbackContainerStyles()}
        ${getQuizStyles()}
        ${getInputSectionStyles()}
        ${quizReviewStyles()}

      </style>
    `;
}

function getBaseStyles(): string {
  return `
      body {
        background-color: #1e1e1e;
        color: #d4d4d4;
        font-family: "Segoe UI", sans-serif;
        padding: 16px;
        text-align: left;
        line-height: 1.5;
      }
    `;
}

function getTextStyles(): string {
  return `
      h3 {
        font-size: 14px;
        margin: 4px 0;
      }
      p {
        font-size: 14px;
        margin-bottom: 10px;
      }
      pre, .content, .section-content {
        background-color: #252526;
        padding: 10px;
        border-radius: 6px;
        font-family: Consolas, monospace;
        font-size: 13px;
        white-space: normal;
        margin-bottom: 10px; 
        border: 1px solid #333;
      }
      .section-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
      }
    `;
}

function getButtonStyles(): string {
  return `
      button {
        padding: 8px 14px;
        font-size: 14px;
        background-color: #0e639c;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 8px;
        transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
      }
      button:hover {
        background-color: #1177bb;
        transform: translateY(-2px);
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
      }
      button:active {
        transform: translateY(0);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
      }
    `;
}

function getFormStyles(): string {
  return `
      textarea, input {
        width: 100%;
        padding: 10px;
        font-size: 14px;
        border-radius: 5px;
        border: 1px solid #333;
        background-color: #252526;
        color: #d4d4d4;
        margin-bottom: 12px;
      }
    `;
}

function getLoadingStyles(): string {
  return `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
      .loading-text {
        font-size: 14px;
        margin-bottom: 12px;
        text-align: center;
        animation: floatText 1.5s ease-in-out infinite;
      }
      .loading-dots::after {
        content: ' .';
        animation: dots 1.5s steps(3, end) infinite;
      }
      @keyframes floatText {
        0% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(-5px); opacity: 0.8; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes dots {
        0% { content: ' .'; }
        33% { content: ' ..'; }
        66% { content: ' ...'; }
        100% { content: ' .'; }
      }
      .spinner {
        display: block;
        margin: 30px auto;
        width: 50px;
        height: 50px;
        border: 5px solid #444;
        border-top: 5px solid #0e639c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
}

function getScoreRingStyles(): string {
  return `
      .score-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
      }
      .score-ring {
        width: 80px;
        height: 80px;
      }
      .score-ring-bg {
        fill: none;
        stroke: #444;
        stroke-width: 8;
      }
      .score-ring-progress {
        fill: none;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.6s ease-in-out;
      }
      .score-text {
        font-size: 16px;
        fill: white;
        font-family: "Segoe UI", sans-serif;
        font-weight: bold;
        text-anchor: middle;
        dominant-baseline: central;
      }
      .score-red { stroke:rgb(255, 25, 0); } /* Below 50% */
      .score-orange { stroke: #e67e22; } /* 50% - 65% */
      .score-yellow { stroke: #f1c40f; } /* 65% - 85% */
      .score-green { stroke: #2ecc71; } /* Above 85% */
    `;
}

function getToggleArrowStyles(): string {
  return `
      .arrow-icon {
        font-size: 16px;
        transition: transform 0.3s ease-in-out;
        margin-left: 10px;
        opacity: 0;
      }
      .toggle-arrow {
        position: absolute;
        top: 71px;
        right: 22px;
        font-size: 16px;
        transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
        opacity: 0;
        pointer-events: none; 
      }
      .toggle-arrow:hover {
        opacity: 0.8;
        box-shadow: 0px 0px 8px rgba(255, 255, 255, 0.3);
      }
      .toggle-arrow.rotated {
        transform: rotate(180deg);
      }
      .collapsible {
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.4s ease-in-out;
      }
  `;
}

function getFeedbackContainerStyles(): string {
  return `
      /* Feedback Section Layout */
      .feedback-container {
        max-width: 600px;
        margin: auto;
      }
      .feedback-section {
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }
      .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 10px;
        transition: background 0.3s ease-in-out;
        border-radius: 6px;
        margin-bottom: 10px;
      }
      .feedback-header:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .feedback-header-content {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;
      }
      .feedback-header h2 {
        margin: 0;
        font-size: 1.2rem;
      }
      .feedback-header:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .feedback-header:hover .arrow-icon {
        opacity: 0.5;
        pointer-events: auto;
      }
    `;
}

function getQuizFollowupStyles(): string {
  return `
      .clarification-section {
        background-color: #252526;
        border-radius: 6px;
        margin-bottom: 10px;
        border: 1px solid #333;
      }

      .clarification-section h3 {
        margin: 0;
        font-size: 1.2rem;
        color: #d4d4d4;
        padding: 10px;
      }
      .clarification-container {
        padding: 10px;
        padding-top: 0;
        border: none;
        font-family: Consolas, monospace;
        white-space: normal;
      }
      .clarification-text {
        padding: 10px;
      }
      .clarification {
        order: 0;
        transition: order 0.3s ease-in-out;
      }
  `;
}

function quizReviewStyles(): string {
  return `
      .quiz-review-container {
        background: #252526;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #333;
      }
      .quiz-review {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .quiz-review-item {
        padding: 8px 0;
        border-bottom: 1px solid #444;
      }
      .quiz-review-item:last-child {
        border-bottom: none;
      }
      .question-text {
        font-weight: bold;
        margin-bottom: 10px;
      }
      .answer-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .correct-answer {
        color: #2ecc71; /* Green */
        font-weight: 400;
      }
      .incorrect-answer {
        color: #e74c3c; /* Red */
        font-weight: 400;
      }
   `;
}

function getQuizResultsStyles(): string {
  return `
      .suggestions-container, .topics-container {
        white-space: normal;
      }
      .topics-container {
        width: 50%;
      }
      .suggestions-container h3, .topics-container h3 {
        margin-bottom: 10px;
      }
      .topics {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      /* Ensure topic container has relative positioning */
      .topic {
        position: relative; /* Makes sure child elements use this as a reference */
        padding: 12px;
        border-radius: 6px;
        margin: 6px 0;
        cursor: pointer;
        transition: background 0.3s ease-in-out;
      }

      /* Arrow positioning */
      .topic-arrow-icon {
        position: absolute;
        top: 8px; 
        right: 10px; 
        font-size: 14px;
        transition: transform 0.3s ease-in-out;
        opacity: 0; /* Initially hidden */
      }

      /* Show arrow when hovering over the topic */
      .topic:hover .arrow-icon {
        opacity: 1;
      }

      /* Rotate arrow when expanded */
      .rotated {
        transform: rotate(180deg);
      }
      .strong-topic {
        background-color:rgb(0, 89, 21);
        border: 1px solid rgb(0, 63, 15);
      }
      .weak-topic {
        background-color:rgb(122, 0, 10);
        border: 1px solid #721c24;
      }
      .topic:hover {
        opacity: 0.8;
      }
      .topic-explanation {
        font-size: 14px;
        margin-top: 5px;
        display: block;
      }
      .hidden {
        display: none;
      }
      .collapsible-content {
        transition: max-height 0.4s ease-in-out;
        overflow: hidden;
        max-height: 1000px;
      }
      .collapsed {
        max-height: 0;
      }
      .suggestions {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 4px;
        line-height: 1;
      }
      .suggestions li {
        display: flex;
        align-items: center;
        gap: 6px;
        line-height: 1;
        padding: 0;
        margin: 0;
        line-height: 20px;
      }
      .suggestions li:last-child {
        margin-bottom: 10px;
      }
      .suggestions li::before {
        content: "💡";
        font-size: 14px;
      }
  `;
}

function getQuizStyles(): string {
  return `
      .option {
        margin: 8px 0;
        transition: transform 0.2s;
      }
      .option:hover {
        transform: scale(1.02);
      }
    `;
}

function getInputSectionStyles(): string {
  return `
      .fixed-input-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #1e1e1e;
        padding: 12px;
        border-top: 1px solid #444;
        box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .input-wrapper {
        display: flex;
        align-items: center;
        height: 18px;
        background-color: #252526;
        border: 1px solid #444;
        border-radius: 6px;
        padding: 10px;
        width: 95%;
        max-width: 800px;
        overflow: hidden;
      }
      .input-wrapper input,
      .input-wrapper textarea {
        flex-grow: 1;
        height: 100%;
        resize: none;
        padding: 10px;
        border: none;
        background-color: transparent;
        color: white;
        outline: none;
        font-size: 14px;
        width: 100%;
        max-width: calc(100% - 50px);
      }
      .send-button {
        padding: 10px;
        font-size: 18px;
        background-color: transparent;
        border: none;
        color: #0e639c;
        cursor: pointer;
        transition: color 0.2s ease-in-out;
        flex-shrink: 0;
      }
      .send-button:hover {
        color: #1177bb;
      }
      #quizFocusInput, #followupInput {
        height: 18px;
        margin-bottom: 0;
      }
      body {
        padding-bottom: 100px;
        overflow-x: hidden;
      }
    `;
}
