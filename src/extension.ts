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
 * @param provider - The Figma reference provider instance
 * @returns Promise that resolves when the command execution is complete
 *
 * @example
 * ```typescript
 * // This function is registered as a VSCode command
 * // and called automatically when the user triggers the command
 * ```
 */
async function handleFindFigmaReferences(
  provider: FigmaReferenceProvider
): Promise<void> {
  const currentFilePath = getCurrentFilePath();

  if (!currentFilePath) {
    await showErrorMessage("No file is currently open");
    return;
  }

  // Focus the Figma References activity bar view
  await vscode.commands.executeCommand(
    "workbench.view.extension.figma-references"
  );

  // Show loading state
  const fileName = currentFilePath.split("/").pop() || currentFilePath;
  provider.showLoading(fileName);

  try {
    const results = await findFigmaReferences({
      filePath: currentFilePath,
      onResultFound: (result) => {
        // Stream results as they're found
        provider.addResult(result, fileName);
      },
      onProgress: (processed, total) => {
        // Update progress indicator
        provider.updateProgress(processed, total);
      },
    });

    // Remove loading state and show final results
    provider.finishLoading(fileName);

    if (results.length === 0) {
      provider.showNoResults("No Figma references found for this file");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    provider.showError(`Error finding Figma references: ${errorMessage}`);
  }
}

/**
 * Activates the extension
 *
 * This function is called when the extension is activated. It registers
 * the command that allows users to find Figma references in git history
 * and sets up the webview provider for the activity bar panel.
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
  // Register the webview provider for the activity bar panel
  const provider = new FigmaReferenceProvider();
  provider.setExtensionUri(context.extensionUri);
  const webviewProviderDisposable = vscode.window.registerWebviewViewProvider(
    "figmaReferencesView",
    provider
  );

  // Register the command to find Figma references
  const commandDisposable = vscode.commands.registerCommand(
    "find-figma-references.find-figma-references",
    () => handleFindFigmaReferences(provider)
  );

  // Add all disposables to the extension's subscriptions
  context.subscriptions.push(commandDisposable, webviewProviderDisposable);

  // Listen for active editor changes and refresh the view
  vscode.window.onDidChangeActiveTextEditor(() => {
    provider.refresh();
  });
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
