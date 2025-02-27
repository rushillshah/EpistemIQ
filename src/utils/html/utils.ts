import { getCommonStyles } from './styles';

function htmlHeader(useMarked: boolean = true): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      ${useMarked ? '<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>' : ''}
      ${getCommonStyles()}
    </head>`;
}

function htmlFooter(): string {
  return `</html>`;
}

export function htmlDocument(
  bodyContent: string,
  useMarked: boolean = true
): string {
  return `${htmlHeader(useMarked)}
    <body>
      ${bodyContent}
    </body>
  ${htmlFooter()}`;
}

export function getVscodeApiScript(): string {
  return `const vscode = acquireVsCodeApi();`;
}

export function renderOptions(
  options: { label: string; isCorrect: boolean }[],
  onClickHandlerName: string = 'selectOption'
): string {
  return options
    .map(
      (opt, idx) => `
      <div class="option">
        <button onclick="${onClickHandlerName}(${idx})">${opt.label}</button>
      </div>`
    )
    .join('');
}
