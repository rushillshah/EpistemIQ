# EpistemIQ

EpistemIQ is a Visual Studio Code extension that integrates interactive, inline assistance for coding decisions using a language model. The extension displays quizzes and follow-up questions in a side panel to help you understand and fix code issues interactively. The idea is to prevent or discourage blind copying from LLM responses, useful in an educational setup

## Features

- **Interactive Quiz:** Displays inline quizzes to diagnose code errors.
- **Code Selection Explanations:** Selected code can be with user defined scope
- **Follow-Up Questions:** Provides follow-up questions when an answer is incorrect.
- **Code Selection Quizzes:** Quizzes for selected code with a user defined scope.
- **Inline Webview Panel:** All interactions occur in a custom side panel within VS Code.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone <your-repo-url>
   cd epesteme-ai
   npm run compile
   ```

   Following this, you can run it in vscode

2. **Prettier commands**
   ```bash
   npm run prettier_check
   npm run prettier_fix
   ```

```
epesteme-ai
├─ .prettierrc
├─ README.md
├─ package-lock.json
├─ package.json
├─ src
│  ├─ commands
│  │  ├─ assistantPanel.ts
│  │  ├─ learnControls.ts
│  │  └─ debugControls.ts
│  ├─ config.ts
│  ├─ extension.ts
│  ├─ providers
│  │  ├─ codeActionsProvider.ts
│  │  ├─ codeLensProvider.ts
│  │  ├─ epistemeContentProvider.ts
│  │  └─ epistemeFixActionProvider.ts
│  ├─ types.d.ts
│  └─ utils
│     ├─ prompts.ts
│     ├─ queryHelpers.ts
│     └─ templates.ts
└─ tsconfig.json

```
