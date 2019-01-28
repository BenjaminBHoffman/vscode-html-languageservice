/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { createScanner } from './parser/htmlScanner';
import { parse } from './parser/htmlParser';
import { HTMLCompletion } from './services/htmlCompletion';
import { doHover } from './services/htmlHover';
import { format } from './services/htmlFormatter';
import { findDocumentLinks } from './services/htmlLinks';
import { findDocumentHighlights } from './services/htmlHighlighting';
import { findDocumentSymbols } from './services/htmlSymbolsProvider';
import { TextDocument, Position, CompletionList, Hover, Range, SymbolInformation, TextEdit, DocumentHighlight, DocumentLink, FoldingRange } from 'vscode-languageserver-types';
import { Scanner, HTMLDocument, CompletionConfiguration, ICompletionParticipant, HTMLFormatConfiguration, DocumentContext, IHTMLDataProvider } from './htmlLanguageTypes';
import { getFoldingRanges } from './services/htmlFolding';
import { handleCustomDataProviders } from './languageFacts';
import { getSelectionRanges } from './services/htmlSelectionRange';

export * from './htmlLanguageTypes';
export * from 'vscode-languageserver-types';
export { HTMLDataProvider } from './languageFacts';

export interface LanguageService {
	createScanner(input: string, initialOffset?: number): Scanner;
	parseHTMLDocument(document: TextDocument): HTMLDocument;
	findDocumentHighlights(document: TextDocument, position: Position, htmlDocument: HTMLDocument): DocumentHighlight[];
	doComplete(document: TextDocument, position: Position, htmlDocument: HTMLDocument, options?: CompletionConfiguration): CompletionList;
	setCompletionParticipants(registeredCompletionParticipants: ICompletionParticipant[]): void;
	doHover(document: TextDocument, position: Position, htmlDocument: HTMLDocument): Hover | null;
	format(document: TextDocument, range: Range | undefined, options: HTMLFormatConfiguration): TextEdit[];
	findDocumentLinks(document: TextDocument, documentContext: DocumentContext): DocumentLink[];
	findDocumentSymbols(document: TextDocument, htmlDocument: HTMLDocument): SymbolInformation[];
	doTagComplete(document: TextDocument, position: Position, htmlDocument: HTMLDocument): string | null;
	getFoldingRanges(document: TextDocument, context?: { rangeLimit?: number }): FoldingRange[];
	getSelectionRanges(document: TextDocument, position: Position): Range[];
}

export interface LanguageServiceOptions {
	customDataProviders?: IHTMLDataProvider[];
}

export function getLanguageService(options?: LanguageServiceOptions): LanguageService {
	const htmlCompletion = new HTMLCompletion();

	if (options && options.customDataProviders) {
		handleCustomDataProviders(options.customDataProviders);
	}

	return {
		createScanner,
		parseHTMLDocument: document => parse(document.getText()),
		doComplete: htmlCompletion.doComplete.bind(htmlCompletion),
		setCompletionParticipants: htmlCompletion.setCompletionParticipants.bind(htmlCompletion),
		doHover,
		format,
		findDocumentHighlights,
		findDocumentLinks,
		findDocumentSymbols,
		getFoldingRanges,
		getSelectionRanges,
		doTagComplete: htmlCompletion.doTagComplete.bind(htmlCompletion),
	};
}
