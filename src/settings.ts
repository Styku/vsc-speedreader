import * as vscode from 'vscode';

export interface Settings {
	excludedWords: Set<string>
}

export function readSettings(): Settings {
	const configuration = vscode.workspace.getConfiguration('speedreader');
	const re = /\s*(?:,|$)\s*/;
	const excluded = configuration.ignoreWords?.split(re);
	return {excludedWords: new Set(excluded)};
}