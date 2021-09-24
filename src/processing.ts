import {Settings} from './settings';

export interface Word {
    word: string;
    count: number;
    span: number;
}

export interface ScoredWord {
    word: string;
    score: number;
}

export function parseSourceCode(text: string, settings: Settings): Word[] {
    const words = text.split(/[^\w]+/);
    let wordsCount = new Map();
    let index = 0;
    for(const w of words) {
        index++;
        if(settings.excludedWords.has(w)) {
            continue;
        }
        if(!wordsCount.has(w)) {
            wordsCount.set(w, {count: 0, first: index, last: index});
        }
        const word = wordsCount.get(w);
        word.count++;
        word.last = index;
        wordsCount.set(w, word);
    }
    wordsCount.delete('');
    const nofWords = words.length;
    let sortedWords = [];
    for(const [key, val] of wordsCount) {
        sortedWords.push({
            "word": key,
            "count": val.count/nofWords,
            "span": (val.last - val.first)/nofWords
        });
    }

    return sortedWords;
}

export function computeScore(words: Word[]) : ScoredWord[] {
    let scored = [];
    const countWeight = 2;
    const spanWeight = 4;
    for(const val of words) {
        scored.push({
            "word": val.word,
            "score": (val.count * countWeight + val.span * spanWeight)/(countWeight + spanWeight)
        });
    }
    return scored;
}

export function getRelevantWords(words: ScoredWord[], limit: number = 5): string[] {
    let relevantWords = [];
    const sorted = words.sort((a, b) => b.score - a.score);
    for(const word of words.slice(0, Math.min(limit, words.length))) {
        relevantWords.push(word.word);
    }
    return relevantWords;
}
