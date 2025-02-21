import * as vscode from 'vscode';

export function buildQuizHtml(
  options: { label: string; isCorrect: boolean }[],
  diagnosticMessage: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
            padding: 12px; 
            background-color: #1e1e1e;
            color: #d4d4d4;
            font-size: 12px;
          }
          h3 {
            margin-bottom: 6px;
            font-size: 16px;
            color: #d4d4d4;
          }
          pre {
            background-color: #252526;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 16px;
            white-space: pre-wrap;
            color: #ce9178;
            font-family: Consolas, monospace;
            font-size: 12px;
          }
          .option {
            margin: 8px 0;
            transition: transform 0.2s;
          }
          .option:hover {
            transform: scale(1.02);
          }
          button {
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            background-color: #0e639c;
            color: #ffffff;
            border: none;
            border-radius: 3px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            transition: background-color 0.2s, transform 0.2s;
          }
          button:hover {
            background-color: #1177bb;
            transform: translateY(-1px);
          }
          button:active {
            transform: translateY(0);
            box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
          }
          code {
            background-color: #3c3c3c;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h3>Issue</h3>
        <pre>${diagnosticMessage}</pre>
        <p>Select the most likely cause of the error:</p>
        <div id="options">
          ${options
            .map(
              (opt, idx) => `
                <div class="option">
                  <button onclick="selectOption(${idx})">${opt.label}</button>
                </div>
              `
            )
            .join('')}
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          function selectOption(index) {
            // Immediately update the options container with a loading message.
            document.getElementById("options").innerHTML = '<p>Evaluating your response...</p>';
            vscode.postMessage({ type: 'optionSelected', index });
          }
        </script>
      </body>
    </html>
  `;
}

export function getUnderstandInputHTML(code: string): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          background-color: #1e1e1e; 
          color: #d4d4d4; 
          font-family: "Segoe UI", sans-serif; 
          padding: 16px; 
        }
        pre { 
          background-color: #252526; 
          padding: 8px; 
          border-radius: 4px; 
          font-family: Consolas, monospace; 
          font-size: 12px; 
          white-space: pre-wrap; 
          margin-bottom: 16px; 
        }
        textarea { 
          width: 100%; 
          height: 100px; 
          font-family: Consolas, monospace; 
          font-size: 12px; 
          margin-bottom: 8px; 
          border-radius: 4px; 
          border: 1px solid #333; 
          background-color: #252526;
          color: #d4d4d4;
          padding: 8px;
        }
        button { 
          padding: 6px 12px; 
          font-size: 12px; 
          background-color: #0e639c; 
          color: #ffffff; 
          border: none; 
          border-radius: 3px; 
          cursor: pointer; 
        }
        button:hover { background-color: #1177bb; }
      </style>
    </head>
    <body>
      <h3>Selected Code</h3>
      <pre>${code}</pre>
      <h3>What do you find confusing or weak about this code?</h3>
      <textarea id="userInput" placeholder="Type your thoughts here..."></textarea>
      <br/>
      <button onclick="submit()">Submit</button>
      <script>
        const vscode = acquireVsCodeApi();
        function submit() {
          const input = document.getElementById('userInput').value;
          vscode.postMessage({ type: 'submitUnderstanding', input });
        }
      </script>
    </body>
  </html>`;
}

/**
 * Returns the HTML for displaying the explanation result.
 */
export function getUnderstandResultHTML(explanation: string): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          background-color: #1e1e1e; 
          color: #d4d4d4; 
          font-family: "Segoe UI", sans-serif; 
          padding: 16px; 
          text-align: center;
        }
        pre { 
          background-color: #252526; 
          padding: 8px; 
          border-radius: 4px; 
          font-family: Consolas, monospace; 
          font-size: 12px; 
          white-space: pre-wrap; 
          margin-bottom: 16px; 
        }
        button { 
          padding: 6px 12px; 
          font-size: 12px; 
          background-color: #0e639c; 
          color: #ffffff; 
          border: none; 
          border-radius: 3px; 
          cursor: pointer; 
          margin-top: 16px;
        }
        button:hover { background-color: #1177bb; }
      </style>
    </head>
    <body>
      <h3>Explanation</h3>
      <pre>${explanation}</pre>
      <button onclick="closePanel()">Close</button>
      <script>
        const vscode = acquireVsCodeApi();
        function closePanel() {
          vscode.postMessage({ type: 'closePanel' });
        }
      </script>
    </body>
  </html>`;
}

/**
 * Returns the HTML for the quiz result screen.
 * @param correctCount The number of correctly answered questions.
 * @param total The total number of questions.
 */
export function getQuizFocusHTML(code: string): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          background-color: #1e1e1e; 
          color: #d4d4d4; 
          font-family: "Segoe UI", sans-serif; 
          padding: 16px;
        }
        pre { 
          background-color: #252526; 
          padding: 8px; 
          border-radius: 4px; 
          font-family: Consolas, monospace; 
          font-size: 12px; 
          white-space: pre-wrap; 
          margin-bottom: 16px; 
        }
        input[type="text"] {
          width: 100%;
          padding: 8px;
          border: 1px solid #333;
          border-radius: 4px;
          background-color: #252526;
          color: #d4d4d4;
          font-size: 12px;
          margin-bottom: 16px;
        }
        button { 
          padding: 6px 12px; 
          font-size: 12px; 
          background-color: #0e639c; 
          color: #ffffff; 
          border: none; 
          border-radius: 3px; 
          cursor: pointer;
        }
        button:hover { 
          background-color: #1177bb;
        }
      </style>
    </head>
    <body>
      <h3>Quiz Focus</h3>
      <pre>${code}</pre>
      <p>Enter the focus for your quiz (e.g. General, Complexity, Logic, Best Practices):</p>
      <input id="quizFocusInput" type="text" placeholder="e.g. General" />
      <button onclick="submitFocus()">Submit</button>
      <script>
        const vscode = acquireVsCodeApi();
        function submitFocus() {
          const focus = document.getElementById("quizFocusInput").value;
          vscode.postMessage({ type: 'quizFocus', focus });
        }
      </script>
    </body>
  </html>`;
}

/**
 * Returns HTML for a single quiz question.
 */
export function getQuizQuestionHTML(questionObj: {
  question: string;
  options: { label: string; isCorrect: boolean }[];
}): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          background-color: #1e1e1e; 
          color: #d4d4d4; 
          font-family: "Segoe UI", sans-serif; 
          padding: 16px; 
        }
        h3 { font-size: 16px; margin-bottom: 8px; }
        pre { 
          background-color: #252526; 
          padding: 8px; 
          border-radius: 4px; 
          font-family: Consolas, monospace; 
          font-size: 12px; 
          white-space: pre-wrap; 
          margin-bottom: 16px; 
        }
        .option { margin: 8px 0; }
        button { 
          padding: 6px 12px; 
          font-size: 12px; 
          background-color: #0e639c; 
          color: #ffffff; 
          border: none; 
          border-radius: 3px; 
          margin-right: 8px; 
          cursor: pointer;
        }
        button:hover { background-color: #1177bb; }
      </style>
    </head>
    <body>
      <h3>Quiz Question</h3>
      <pre>${questionObj.question}</pre>
      <div id="options">
        ${questionObj.options
          .map(
            (opt, index) => `
          <div class="option">
            <button onclick="selectOption(${index})">${opt.label}</button>
          </div>
        `
          )
          .join('')}
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        function selectOption(index) {
          vscode.postMessage({ type: 'optionSelected', index: index });
        }
      </script>
    </body>
  </html>`;
}

export function getQuizFeedbackHTML(feedback: string): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-family: "Segoe UI", sans-serif;
          padding: 16px;
          text-align: center;
        }
        pre {
          background-color: #252526;
          padding: 8px;
          border-radius: 4px;
          font-family: Consolas, monospace;
          font-size: 12px;
          white-space: pre-wrap;
          margin-bottom: 16px;
        }
        button {
          padding: 6px 12px;
          font-size: 12px;
          background-color: #0e639c;
          color: #ffffff;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          margin-top: 16px;
        }
        button:hover { background-color: #1177bb; }
      </style>
    </head>
    <body>
      <h3>Quiz Feedback</h3>
      <pre>${feedback}</pre>
      <button onclick="closePanel()">Close</button>
      <script>
        const vscode = acquireVsCodeApi();
        function closePanel() {
          vscode.postMessage({ type: 'closePanel' });
        }
      </script>
    </body>
  </html>`;
}

// In src/utils/templates.ts
export function getInitialChoiceTemplate(errorMessage: string): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-family: "Segoe UI", sans-serif;
          padding: 16px;
          text-align: center;
        }
        h3 {
          font-size: 16px;
          margin-bottom: 12px;
        }
        p {
          font-size: 12px;
          margin-bottom: 24px;
        }
        button {
          padding: 8px 16px;
          font-size: 14px;
          margin: 0 8px;
          background-color: #0e639c;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #1177bb;
        }
      </style>
    </head>
    <body>
      <h3>Diagnostic: ${errorMessage}</h3>
      <p>Select an option to learn more:</p>
      <button onclick="selectChoice('understand')">Understand</button>
      <button onclick="selectChoice('quiz')">Quiz</button>
      <script>
        const vscode = acquireVsCodeApi();
        function selectChoice(choice) {
          vscode.postMessage({ type: 'choiceSelected', choice });
        }
      </script>
    </body>
  </html>`;
}

export function getCombinedExplanationTemplate(
  explanation: string,
  feedback: string
): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-family: "Segoe UI", sans-serif;
          padding: 16px;
        }
        .section {
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 16px;
          margin-bottom: 8px;
        }
        .section-content {
          background-color: #252526;
          padding: 8px;
          border-radius: 4px;
          font-family: Consolas, monospace;
          font-size: 12px;
          white-space: pre-wrap;
        }
        .divider {
          border-top: 2px solid #444;
          margin: 16px 0;
        }
        button {
          padding: 6px 12px;
          font-size: 12px;
          background-color: #0e639c;
          color: #ffffff;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          margin-top: 16px;
        }
        button:hover {
          background-color: #1177bb;
        }
      </style>
    </head>
    <body>
      <div class="section">
        <div class="section-title">Explanation of the Issue</div>
        <div class="section-content">${explanation}</div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title">Feedback on Your Understanding</div>
        <div class="section-content">${feedback}</div>
      </div>
      <button onclick="closePanel()">Close</button>
      <script>
        const vscode = acquireVsCodeApi();
        function closePanel() {
          vscode.postMessage({ type: 'closePanel' });
        }
      </script>
    </body>
  </html>`;
}
