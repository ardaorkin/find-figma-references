import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import type { FigmaReferenceResult } from "../types";
import { getCurrentFilePath } from "../utils/vscodeUtils";
import { findFigmaReferences } from "../services/figmaReferenceService";
import { saveGitHubToken, hasGitHubToken } from "../utils/settingsUtils";

/**
 * Provider for the Figma References Webview
 *
 * This class manages the webview that displays Figma references
 * in a dedicated panel in the Activity Bar.
 */
export class FigmaReferenceProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "figmaReferencesView";
  private _panel: vscode.WebviewPanel | undefined = undefined;
  private _view: vscode.WebviewView | undefined = undefined;
  private _extensionUri: vscode.Uri | undefined = undefined;

  /**
   * Sets the extension URI for the provider
   *
   * @param extensionUri - The URI of the extension
   */
  public setExtensionUri(extensionUri: vscode.Uri): void {
    this._extensionUri = extensionUri;
  }

  /**
   * Resolves the webview view for the activity bar panel
   *
   * This method is called by VSCode when the webview view needs to be created.
   * It sets up the webview with the appropriate HTML content and message handling.
   *
   * @param webviewView - The webview view to resolve
   * @param context - The webview view resolve context
   * @param token - The cancellation token
   */
  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this._view = webviewView;

    if (!this._extensionUri) {
      return;
    }

    // Set the webview options
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Set the initial HTML content
    webviewView.webview.html = this._getHtmlForWebview(
      webviewView.webview,
      this._extensionUri
    );

    // Show loading and fetch references
    const filePath = getCurrentFilePath();
    const fileName = filePath
      ? filePath.split("/").pop() || filePath
      : "this file";
    this.showLoading(fileName);
    await this.refresh();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "refresh":
          this.refresh();
          break;
        case "saveGitHubToken":
          await this.saveGitHubToken(message.token);
          break;
        case "checkGitHubToken":
          this.checkGitHubToken();
          break;
      }
    });
  }

  /**
   * Refreshes the Figma references for the current file and updates the view
   */
  public async refresh(): Promise<void> {
    const filePath = getCurrentFilePath();
    if (filePath) {
      try {
        const fileName = filePath.split("/").pop() || filePath;
        this.showLoading(fileName);

        const results = await findFigmaReferences({
          filePath,
          onResultFound: (result) => {
            // Stream results as they're found
            this.addResult(result, fileName);
          },
          onProgress: (processed, total) => {
            // Update progress indicator
            this.updateProgress(processed, total);
          },
        });

        // Remove loading state and show final results
        this.finishLoading(fileName);

        if (results.length === 0) {
          this.showNoResults("No Figma references found for this file");
        }
      } catch (error) {
        this.showError(`Error finding Figma references: ${error}`);
      }
    } else {
      this.showNoResults("No file is currently open");
    }
  }

  /**
   * Creates or shows the Figma References panel
   *
   * @param extensionUri - The URI of the extension
   * @returns The webview panel
   *
   * @example
   * ```typescript
   * const provider = new FigmaReferenceProvider();
   * const panel = provider.createOrShow(extensionUri);
   * ```
   */
  public createOrShow(extensionUri: vscode.Uri): vscode.WebviewPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (this._panel) {
      this._panel.reveal(column);
      return this._panel;
    }

    // Otherwise, create a new panel
    this._panel = vscode.window.createWebviewPanel(
      FigmaReferenceProvider.viewType,
      "Figma References",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
        retainContextWhenHidden: true,
      }
    );

    // Set the webview's initial html content
    this._panel.webview.html = this._getHtmlForWebview(
      this._panel.webview,
      extensionUri
    );

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this._dispose(), null, []);

    return this._panel;
  }

  /**
   * Updates the content of the webview with Figma reference results
   *
   * @param results - Array of Figma reference results to display
   * @param fileName - The name of the current file
   *
   * @example
   * ```typescript
   * const results = [{ prUrl: "...", author: "John", figmaUrls: ["..."] }];
   * provider.updateContent(results, "src/components/Button.tsx");
   * ```
   */
  public updateContent(
    results: FigmaReferenceResult[],
    fileName?: string
  ): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "updateResults",
        results: results,
        fileName: fileName || "this file",
      });
    }
  }

  /**
   * Adds a single result to the existing results in the webview
   *
   * @param result - Single Figma reference result to add
   * @param fileName - The name of the current file
   *
   * @example
   * ```typescript
   * const result = { prUrl: "...", author: "John", figmaUrls: ["..."] };
   * provider.addResult(result, "src/components/Button.tsx");
   * ```
   */
  public addResult(result: FigmaReferenceResult, fileName?: string): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "addResult",
        result: result,
        fileName: fileName || "this file",
      });
    }
  }

  /**
   * Updates the progress indicator in the webview
   *
   * @param processed - Number of commits processed
   * @param total - Total number of commits to process
   *
   * @example
   * ```typescript
   * provider.updateProgress(10, 50); // 20% complete
   * ```
   */
  public updateProgress(processed: number, total: number): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "updateProgress",
        processed: processed,
        total: total,
      });
    }
  }

  /**
   * Removes the loading state and shows final results
   *
   * @param fileName - The name of the current file
   *
   * @example
   * ```typescript
   * provider.finishLoading("Button.tsx");
   * ```
   */
  public finishLoading(fileName?: string): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "finishLoading",
        fileName: fileName || "this file",
      });
    }
  }

  /**
   * Shows a loading state in the webview
   *
   * @param fileName - The name of the current file
   * @example
   * ```typescript
   * provider.showLoading("Button.tsx");
   * ```
   */
  public showLoading(fileName?: string): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "showLoading",
        fileName: fileName || "this file",
      });
    }
  }

  /**
   * Shows an error message in the webview
   *
   * @param message - The error message to display
   *
   * @example
   * ```typescript
   * provider.showError('Failed to fetch results');
   * ```
   */
  public showError(message: string): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "showError",
        message: message,
      });
    }
  }

  /**
   * Shows a "no results" message in the webview
   *
   * @param message - The message to display when no results are found
   *
   * @example
   * ```typescript
   * provider.showNoResults('No Figma references found');
   * ```
   */
  public showNoResults(message: string): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "showNoResults",
        message: message,
      });
    }
  }

  /**
   * Saves the GitHub token to VSCode settings
   *
   * @param token - The GitHub token to save
   * @returns Promise that resolves when the token is saved
   *
   * @example
   * ```typescript
   * await provider.saveGitHubToken('ghp_...');
   * ```
   */
  public async saveGitHubToken(token: string): Promise<void> {
    try {
      await saveGitHubToken(token);
      if (this._view) {
        this._view.webview.postMessage({
          command: "tokenSaved",
          success: true,
        });
      }
    } catch (error) {
      if (this._view) {
        this._view.webview.postMessage({
          command: "tokenSaved",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Checks if a GitHub token is configured and notifies the webview
   *
   * @example
   * ```typescript
   * provider.checkGitHubToken();
   * ```
   */
  public checkGitHubToken(): void {
    const hasToken = hasGitHubToken();
    if (this._view) {
      this._view.webview.postMessage({
        command: "tokenStatus",
        hasToken: hasToken,
      });
    }
  }

  /**
   * Shows the token input section in the webview
   *
   * @example
   * ```typescript
   * provider.showTokenInput();
   * ```
   */
  public showTokenInput(): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "showTokenInput",
      });
    }
  }

  /**
   * Disposes of the webview panel
   *
   * @example
   * ```typescript
   * provider.dispose();
   * ```
   */
  public dispose(): void {
    if (this._panel) {
      this._panel.dispose();
      this._panel = undefined;
    }
  }

  /**
   * Internal method to dispose the panel
   */
  private _dispose(): void {
    this._panel = undefined;
  }

  /**
   * Generates the HTML content for the webview
   *
   * @param webview - The webview instance
   * @param extensionUri - The URI of the extension
   * @returns The HTML content as a string
   */
  private _getHtmlForWebview(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ): string {
    const htmlPath = path.join(
      extensionUri.fsPath,
      "src",
      "ui",
      "webview.html"
    );

    try {
      const htmlContent = fs.readFileSync(htmlPath, "utf8");
      return htmlContent;
    } catch (error) {
      return this._getFallbackHtml();
    }
  }

  /**
   * Provides fallback HTML content if the file cannot be read
   *
   * @returns Fallback HTML content
   */
  private _getFallbackHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Figma References</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .title {
            font-size: 1.5em;
            font-weight: bold;
            color: var(--vscode-editor-foreground);
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
        .spinner {
            border: 2px solid var(--vscode-panel-border);
            border-top: 2px solid var(--vscode-progressBar-background);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">Figma References</div>
        </div>
        <div id="content">
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading Figma references...</p>
            </div>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        window.addEventListener('message', event => {
            const message = event.data;
            const content = document.getElementById('content');
            
            switch (message.command) {
                case 'updateResults':
                    if (message.results.length === 0) {
                        content.innerHTML = '<div class="no-results"><p>No Figma references found for this file.</p></div>';
                    } else {
                        const resultsHtml = message.results.map(result => {
                            const figmaUrlsHtml = result.figmaUrls.map(url => 
                                '<a href="' + url + '" class="figma-url" target="_blank">' + url + '</a>'
                            ).join('');
                            
                            return '<div class="result-item">' +
                                '<a href="' + result.prUrl + '" class="pr-link" target="_blank">' + result.prUrl + '</a>' +
                                '<div class="author">Author: ' + result.author + '</div>' +
                                '<div class="figma-urls"><strong>Figma URLs:</strong><br>' + figmaUrlsHtml + '</div>' +
                                '</div>';
                        }).join('');
                        content.innerHTML = resultsHtml;
                    }
                    break;
                case 'showLoading':
                    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading Figma references...</p></div>';
                    break;
                case 'showError':
                    content.innerHTML = '<div class="error"><p>Error: ' + message.message + '</p></div>';
                    break;
                case 'showNoResults':
                    content.innerHTML = '<div class="no-results"><p>' + message.message + '</p></div>';
                    break;
            }
        });
    </script>
</body>
</html>`;
  }
}
