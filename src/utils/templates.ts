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

export function buildFollowupHtml(followup: {
  question: string;
  options: { label: string; isCorrect: boolean }[];
}): string {
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
        <h3>Follow-up Question</h3>
        <pre>${followup.question}</pre>
        <p>Select the correct answer:</p>
        <div id="options">
          ${followup.options
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
            document.getElementById("options").innerHTML = '<p>Evaluating your response...</p>';
            vscode.postMessage({ type: 'optionSelected', index });
          }
        </script>
      </body>
    </html>
  `;
}

export function showLoadingState(
  panel: vscode.WebviewPanel,
  message: string
): void {
  panel.webview.html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
              padding: 16px; 
              background-color: #1e1e1e;
              color: #d4d4d4;
              font-size: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
            }
            p { font-size: 14px; }
          </style>
        </head>
        <body>
          <p>${message}</p>
        </body>
      </html>
    `;
}

export const LOADING_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { 
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
        padding: 16px; 
        background-color: #1e1e1e;
        color: #d4d4d4;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      p { font-size: 14px; }
    </style>
  </head>
  <body>
    <p>Building your personalized learning plan...</p>
  </body>
</html>
`;

export const SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { 
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
        padding: 16px; 
        background-color: #1e1e1e;
        color: #d4d4d4;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <p>Fix applied.</p>
  </body>
</html>
`;

export const REJECT_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { 
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
        padding: 16px; 
        background-color: #1e1e1e;
        color: #d4d4d4;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <p>Fix rejected.</p>
  </body>
</html>
`;

// Template for displaying the fix suggestion with Apply/Reject buttons.
// We use a function so that the fix suggestion can be injected.
export const FIX_SUGGESTION_TEMPLATE = (fixSuggestion: string) => {
    // Regex to capture a code block with an optional language identifier.
    const codeBlockRegex = /^```(\w+)?\n([\s\S]*?)\n```$/;
    let language = "";
    let codeContent = fixSuggestion;
  
    const match = fixSuggestion.match(codeBlockRegex);
    if (match) {
      language = match[1] || "";
      codeContent = match[2];
    }
  
    return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
          padding: 16px; 
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-size: 12px;
        }
        h3 { margin-bottom: 6px; font-size: 16px; }
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
        .option { margin: 8px 0; }
        button { 
          padding: 6px 12px; 
          font-size: 12px; 
          cursor: pointer; 
          background-color: #0e639c; 
          color: #ffffff; 
          border: none; 
          border-radius: 3px; 
          margin-right: 8px;
        }
        button:hover { background-color: #1177bb; }
      </style>
    </head>
    <body>
      <h3>Fix Suggestion</h3>
      ${language ? `<p style="font-style: italic; color: #9CDCFE;">${language.toUpperCase()} code:</p>` : ""}
      <pre>${codeContent}</pre>
      <div class="option">
        <button onclick="selectOption(0)">Apply Fix</button>
        <button onclick="selectOption(1)">Reject</button>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        function selectOption(index) {
          vscode.postMessage({ type: 'optionSelected', index });
        }
      </script>
    </body>
  </html>
  `;
  };

  // src/utils/templates.ts

/**
 * Returns the HTML for the "Understand with Episteme" input screen.
 * Displays the selected code and a textarea for the user to describe what they find confusing.
 */
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
  export function getQuizQuestionHTML(questionObj: { question: string, options: { label: string, isCorrect: boolean }[] }): string {
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
        ${questionObj.options.map((opt, index) => `
          <div class="option">
            <button onclick="selectOption(${index})">${opt.label}</button>
          </div>
        `).join('')}
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
  
  /**
   * Returns HTML for the quiz result screen.
   */
  export function getQuizResultHTML(correctCount: number, total: number): string {
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
        h3 { font-size: 16px; margin-bottom: 8px; }
        p { font-size: 14px; }
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
      <h3>Quiz Completed</h3>
      <p>You answered ${correctCount} out of ${total} questions correctly.</p>
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
   * Returns HTML for the final feedback screen.
   * This should display the feedback on the student's understanding.
   */
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
export function EXPLANATION_TEMPLATE(fixExplanation: string): string {
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
          text-align: left;
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
        button { 
          padding: 6px 12px; 
          font-size: 12px; 
          background-color: #0e639c; 
          color: #fff; 
          border: none; 
          border-radius: 3px; 
          cursor: pointer; 
          margin-top: 16px;
        }
        button:hover { background-color: #1177bb; }
      </style>
    </head>
    <body>
      <h3>Explanation and Suggested Fix</h3>
      <pre>${fixExplanation}</pre>
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