import * as vscode from 'vscode';
import {getRelevantWords, parseSourceCode, computeScore} from './processing';
import {readSettings} from './settings';

function createDecorationArray(levels: number) : vscode.TextEditorDecorationType[] {
	let decorationTypes = [];

	for(let i = 1; i <= levels; i++) {
		decorationTypes.push(vscode.window.createTextEditorDecorationType({
			light: {backgroundColor: 'rgba(0, 255, 0, ' + (0.5 - 0.5*i/(levels+1)) + ')'},
			dark: {backgroundColor: 'rgba(255, 255, 255, ' + (0.5 - 0.5*i/(levels+1)) + ')'}
		}));
	}
	
	return decorationTypes;
}

export function activate(context: vscode.ExtensionContext) {
	const settings = readSettings();

	const wordsOfInterestDecoration = createDecorationArray(5);

	function applyStyling(words: string[], editor: vscode.TextEditor, selection: vscode.Selection) {
		if (!editor) {
			return;
		}
		const text = editor.document.getText(selection);
		const wordsToDecorate: vscode.DecorationOptions[][] = [];
		let match;

		const word = words[0];
		const offset = editor.document.offsetAt(selection.start);
		
		for(const word of words) {
			let index = text.indexOf(word, 0);
			let wordOccurences = [];

			while(index >= 0) {
				const startPos = editor.document.positionAt(index + offset);
				const endPos = editor.document.positionAt(index + offset + word.length);
				const decoration = { range: new vscode.Range(startPos, endPos) };
				wordOccurences.push(decoration);
				index = text.indexOf(word, index + 1);
			}
			
			wordsToDecorate.push(wordOccurences);
		}
		
		for(var [key, wordPosition] of wordsToDecorate.entries()) {
			editor.setDecorations(wordsOfInterestDecoration[key], wordPosition);
		}
	}

	let disposable = vscode.commands.registerCommand('codespeedreader.HighlightRelevant', () => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selection = !editor.selection.isEmpty
				? editor.selection 
				: new vscode.Selection(document.positionAt(0), document.positionAt(document.getText().length));

			wordsOfInterestDecoration.forEach((decoration) => {
				editor.setDecorations(decoration, [new vscode.Range(selection.start, selection.end)]);
			});

			const selectedText = document.getText(selection);
			const words = parseSourceCode(selectedText, settings);
			const scoredWords = computeScore(words);
			const relevantWords = getRelevantWords(scoredWords);
			applyStyling(relevantWords, editor, selection);

			// vscode.commands.executeCommand<vscode.Location[]>(
			// 	'vscode.provideDocumentSemanticTokens',
			// 	editor.document.uri
			//   ).then((data) => {
			// 	  console.log("Provider executed");
			// 	  console.log(data);

			//   });
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
