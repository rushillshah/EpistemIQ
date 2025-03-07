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

The MIT License (MIT)

Copyright (c) 2016 Ricardo García Vega

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
