import { describe, it, expect, spyOn, mock } from "bun:test";
import * as vscode from "vscode";

import { activate } from "./extension.ts";

// Mock VSCode modules
const mockCommands = {
  registerCommand: mock(() => ({ dispose: () => {} })),
};

const mockContext = {
  subscriptions: [],
  extensionUri: { fsPath: "/test/path" },
} as any;

// Mock the vscode module
mock.module("vscode", () => ({
  commands: mockCommands,
  window: {
    activeTextEditor: undefined,
    showErrorMessage: mock(() => Promise.resolve()),
  },
  ViewColumn: { One: 1 },
}));

describe("extension", () => {
  describe("activation", () => {
    it("registers the find figma references command", () => {
      activate(mockContext);

      expect(vscode.commands.registerCommand).toHaveBeenCalled();
      const command = (vscode.commands.registerCommand as any).mock.calls[0][0];
      const callback = (vscode.commands.registerCommand as any).mock
        .calls[0][1] as Function;

      expect(command).toEqual("bun-vscode-extension.find-figma-references");
      expect(typeof callback).toBe("function");
    });

    it("adds command to subscriptions", () => {
      mockContext.subscriptions = []; // Reset subscriptions
      activate(mockContext);
      expect(mockContext.subscriptions).toHaveLength(1);
    });
  });
});
