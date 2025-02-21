# Episteme

Episteme is a Visual Studio Code extension that integrates interactive, inline assistance for coding decisions using a language model. The extension displays quizzes and follow-up questions in a side panel to help you understand and fix code issues interactively. The idea is to prevent or discourage blind copying from LLM responses, useful in an educational setup

## Features

- **Interactive Quiz:** Displays inline quizzes to diagnose code errors.
- **Follow-Up Questions:** Provides follow-up questions when an answer is incorrect.
- **Fix Suggestions:** Shows a fix suggestion with **Apply**/**Reject** options that can automatically update your code.
- **Inline Webview Panel:** All interactions occur in a custom side panel within VS Code.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone <your-repo-url>
   cd learncode-ai
   npm run compile
   ```

   Following this, you can run it in vscode

2. **Prettier commands**
   ```bash
   npm run prettier_check
   npm run prettier_fix
   ```
