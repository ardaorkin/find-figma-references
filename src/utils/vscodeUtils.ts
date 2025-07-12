import * as vscode from "vscode";

/**
 * Gets the file path of the currently active text editor
 *
 * @returns The file path of the active editor, or undefined if no editor is active
 *
 * @example
 * ```typescript
 * const filePath = getCurrentFilePath();
 * if (filePath) {
 *   console.log('Current file:', filePath);
 * }
 * ```
 */
export function getCurrentFilePath(): string | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return undefined;
  }

  return activeEditor.document.uri.fsPath;
}

/**
 * Creates and shows a new text document with the provided content
 *
 * @param content - The content to display in the new document
 * @param language - The language identifier for syntax highlighting (optional)
 * @returns Promise that resolves when the document is shown
 *
 * @example
 * ```typescript
 * const content = "Git History Results:\n- Commit 1\n- Commit 2";
 * await showTextDocument(content, 'plaintext');
 * ```
 */
export async function showTextDocument(
  content: string,
  language: string = "plaintext"
): Promise<void> {
  const document = await vscode.workspace.openTextDocument({
    content: content,
    language: language,
  });

  await vscode.window.showTextDocument(document);
}

/**
 * Shows an information message to the user
 *
 * @param message - The message to display
 * @returns Promise that resolves when the message is dismissed
 *
 * @example
 * ```typescript
 * await showInformationMessage('Operation completed successfully');
 * ```
 */
export async function showInformationMessage(message: string): Promise<void> {
  await vscode.window.showInformationMessage(message);
}

/**
 * Shows an error message to the user
 *
 * @param message - The error message to display
 * @returns Promise that resolves when the message is dismissed
 *
 * @example
 * ```typescript
 * await showErrorMessage('Failed to fetch git history');
 * ```
 */
export async function showErrorMessage(message: string): Promise<void> {
  await vscode.window.showErrorMessage(message);
}

/**
 * Shows a warning message to the user
 *
 * @param message - The warning message to display
 * @returns Promise that resolves when the message is dismissed
 *
 * @example
 * ```typescript
 * await showWarningMessage('GitHub token not configured');
 * ```
 */
export async function showWarningMessage(message: string): Promise<void> {
  await vscode.window.showWarningMessage(message);
}

/**
 * Checks if a file path is valid and exists
 *
 * @param filePath - The file path to validate
 * @returns True if the file path is valid and exists, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isValidFilePath('/path/to/file.ts');
 * if (isValid) {
 *   // Process the file
 * }
 * ```
 */
export function isValidFilePath(filePath: string): boolean {
  if (!filePath || typeof filePath !== "string") {
    return false;
  }

  try {
    const uri = vscode.Uri.file(filePath);
    return uri.scheme === "file";
  } catch {
    return false;
  }
}

/**
 * Gets the workspace folder for a given file path
 *
 * @param filePath - The file path to get workspace for
 * @returns The workspace folder, or null if file is not in a workspace
 *
 * @example
 * ```typescript
 * const workspace = getWorkspaceFolder('/path/to/file.ts');
 * if (workspace) {
 *   console.log('Workspace:', workspace.name);
 * }
 * ```
 */
export function getWorkspaceFolder(
  filePath: string
): vscode.WorkspaceFolder | null {
  try {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(
      vscode.Uri.file(filePath)
    );
    return workspaceFolder || null;
  } catch {
    return null;
  }
}
