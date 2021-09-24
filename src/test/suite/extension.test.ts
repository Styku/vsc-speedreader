import * as assert from 'assert';
import * as vscode from 'vscode';
import * as processing from '../../processing';
import {Settings} from '../../settings';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Text processing test', () => {
		const input = 'testing string,<keyword> keyword\n\t(keyword, string)';
		const expected = [
			{word: "testing", count: 0.14285714285714285, span: 0},
			{word: "string", count: 0.2857142857142857, span: 0.5714285714285714},
			{word: "keyword", count: 0.42857142857142855, span: 0.2857142857142857}
		];
		const settings: Settings = {excludedWords: new Set()};
		const words = processing.parseSourceCode(input, settings);

		assert.strictEqual(words.length, 3);
		assert.deepStrictEqual(words, expected);
	});

	test('Text scoring', () => {
		const input = [
			{word: "testing", count: 0.14285714285714285, span: 0},
			{word: "string", count: 0.2857142857142857, span: 0.5714285714285714},
			{word: "keyword", count: 0.42857142857142855, span: 0.2857142857142857}
		];

		const expected = [
			{word: "testing", score: 0.047619047619047616},
			{word: "string", score: 0.4761904761904761},
			{word: "keyword", score: 0.3333333333333333}
		];

		let words = processing.computeScore(input);
		assert.deepStrictEqual(words, expected);
	});
});
