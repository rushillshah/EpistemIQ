import { getFollowupSection } from './reusableComponents';

import { getVscodeApiScript, htmlDocument } from '../utils';
import { getCommonStyles } from '../styles';

import { formatLLMResponse } from '../../ui/uiHelpers';

export function getUnderstandInputHTML(code: string): string {
  const formattedCode = formatLLMResponse(code);
  const bodyContent = `
    <h3>Selected Code</h3>
    <pre id="codeBlock"></pre>
    <h3>What do you find confusing or weak about this code?</h3>
    <textarea id="userInput" placeholder="Type your thoughts here..."></textarea>
    <br/>
    <button onclick="submit()">Submit</button>
    <script>
      document.getElementById("codeBlock").textContent = ${JSON.stringify(formattedCode)};
      ${getVscodeApiScript()}
      function submit() {
        const input = document.getElementById('userInput').value;
        vscode.postMessage({ type: 'submitUnderstanding', input });
      }
    </script>
  `;
  return htmlDocument(bodyContent);
}

export function getUnderstandResultHTML(explanation: string): string {
  const formattedExplanation = formatLLMResponse(explanation);
  const bodyContent = `
    <h3>Explanation</h3>
    <pre id="explanationBlock"></pre>
    <button onclick="closePanel()">Close</button>
    <script>
      document.getElementById("explanationBlock").textContent = ${JSON.stringify(formattedExplanation)};
      ${getVscodeApiScript()}
      function closePanel() {
        vscode.postMessage({ type: 'closePanel' });
      }
    </script>
  `;
  return htmlDocument(bodyContent);
}

export function getCombinedExplanationTemplate(
  explanation: string | null | undefined,
  feedback: string | null | undefined,
  followupType: string = 'submitFollowup'
): string {
  const safeExplanation = typeof explanation === 'string' ? explanation : '';
  const safeFeedback = typeof feedback === 'string' ? feedback : '';

  const formattedExplanation = formatLLMResponse(safeExplanation);
  const formattedFeedback = formatLLMResponse(safeFeedback);

  const bodyContent = `
    <div class="section">
      <div class="section-title">Explanation of the Issue</div>
      <div class="section-content" id="explanationBlock"></div>
    </div>
    ${
      formattedFeedback
        ? `<div class="divider"></div>
      <div class="section">
        <div class="section-title">Feedback on Your Understanding</div>
        <div class="section-content" id="feedbackBlock"></div>
      </div>`
        : ''
    }
    ${getFollowupSection(followupType)}
    <script>
      document.getElementById("explanationBlock").textContent = ${JSON.stringify(formattedExplanation)};
      ${
        formattedFeedback
          ? `document.getElementById("feedbackBlock").textContent = ${JSON.stringify(formattedFeedback)};`
          : ''
      }
    </script>
  `;

  return htmlDocument(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        ${getCommonStyles()}
      </head>
      <body>
        ${bodyContent}
      </body>
    </html>
  `);
}

export function getUnderstandResultWithFollowupHTML(
  explanation: string
): string {
  const formattedExplanation = formatLLMResponse(explanation);
  const bodyContent = `
    <h3>Explanation</h3>
    <div class="content" id="explanationBlock"></div>
    ${getFollowupSection('submitFollowup')}
    <script>
      document.getElementById("explanationBlock").textContent = ${JSON.stringify(formattedExplanation)};
    </script>
  `;
  return htmlDocument(bodyContent);
}
