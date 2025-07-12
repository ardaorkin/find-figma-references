import * as vscode from "vscode";
import { findFigmaReferences } from "./services/figmaReferenceService";
import { getCurrentFilePath, showErrorMessage } from "./utils/vscodeUtils";
import { FigmaReferenceProvider } from "./ui/figmaReferenceProvider";

/**
 * Main command handler for finding Figma references in git history
 *
 * This function is called when the user executes the "Find Figma References" command.
 * It gets the current file path, finds Figma references in its git history,
 * and displays the results in a dedicated webview panel.
 *
 * @param context - The extension context
 * @returns Promise that resolves when the command execution is complete
 *
 * @example
 * ```typescript
 * // This function is registered as a VSCode command
 * // and called automatically when the user triggers the command
 * ```
 */
async function handleFindFigmaReferences(
  context: vscode.ExtensionContext
): Promise<void> {
  const currentFilePath = getCurrentFilePath();

  if (!currentFilePath) {
    await showErrorMessage("No file is currently open");
    return;
  }

  // Create or show the Figma References panel
  const provider = new FigmaReferenceProvider();
  const panel = provider.createOrShow(context.extensionUri);

  // Show loading state
  provider.showLoading();

  try {
    const results = await findFigmaReferences({ filePath: currentFilePath });

    if (results.length === 0) {
      provider.showNoResults("No Figma references found for this file");
      return;
    }

    provider.updateContent(results);
  } catch (error) {
    provider.showError(`Error finding Figma references: ${error}`);
  }
}

/**
 * Activates the extension
 *
 * This function is called when the extension is activated. It registers
 * the command that allows users to find Figma references in git history.
 *
 * @param context - The extension context provided by VSCode
 *
 * @example
 * ```typescript
 * // This function is called automatically by VSCode when the extension is activated
 * export const activate = (context: vscode.ExtensionContext) => {
 *   // Register commands, event listeners, etc.
 * };
 * ```
 */
export const activate = (context: vscode.ExtensionContext) => {
  // Register the command to find Figma references
  const disposable = vscode.commands.registerCommand(
    "bun-vscode-extension.find-figma-references",
    () => handleFindFigmaReferences(context)
  );

  // Add the command to the extension's subscriptions
  context.subscriptions.push(disposable);
};

/**
 * Deactivates the extension
 *
 * This function is called when the extension is deactivated. It can be used
 * to clean up resources, but in this case no cleanup is needed.
 *
 * @example
 * ```typescript
 * // This function is called automatically by VSCode when the extension is deactivated
 * export const deactivate = () => {
 *   // Clean up resources if needed
 * };
 * ```
 */
export const deactivate = () => {
  // No cleanup needed for this extension
};
