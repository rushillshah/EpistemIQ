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
export const FIX_SUGGESTION_TEMPLATE = (fixSuggestion: string) => `
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
    <pre>${fixSuggestion}</pre>
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
