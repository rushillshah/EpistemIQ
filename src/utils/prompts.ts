import * as vscode from 'vscode';

export const followupQuestionPrompt = (diagnostic: vscode.Diagnostic) => {
  return `For the diagnostic error: "${diagnostic.message}",
          generate two follow-up questions to help a developer understand the error better.
          Each question should be provided with three multiple-choice options (as a JSON array),
          where one option is correct. Provide a hint as well in the question text. Format the response as a JSON array of objects like:
          [{"question": "Question text", "options": [{"label": "Option 1", "isCorrect": false}, {"label": "Option 2", "isCorrect": true}, {"label": "Option 3", "isCorrect": false}]}].`;
};

export const initialQuestionPrompt = (diagnostic: vscode.Diagnostic) => {
  return `Given the following diagnostic error: "${diagnostic.message}",
          list three potential causes as a JSON array of objects with "label" and "isCorrect" (true for the correct cause, others false).
          For example: [{"label": "Missing semicolon", "isCorrect": false}, {"label": "Incorrect variable type", "isCorrect": true}, {"label": "Mismatched brackets", "isCorrect": false}].`;
};
