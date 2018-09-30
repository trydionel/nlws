import { sample } from './random';
import { WordlistResult } from '@/game';

interface DatamuseWord {
  word: string;
}

const Topics = [
  'sports',
  'art',
  'science',
  'chemistry',
  'physics',
  'kids',
  'school',
  'medical',
  'internet',
  'music',
  'audio',
  'space'
];

export class WordlistBuilder {
  public async get(count: number): Promise<WordlistResult> {
    const topic = sample(Topics);

    const result = fetch(`https://api.datamuse.com/words?rel_trg=${topic}&max=100`);

    return result.then((response) => {
      return response.json();
    }).then((json: DatamuseWord[]) => {
      const selected = new Set();
      while (selected.size < count) {
        const entry = sample(json) as DatamuseWord;
        const word = entry.word;
        if (word.length < 8) {
          selected.add(word);
        }
      }

      return {
        count,
        topic,
        words: Array.from(selected)
      };
    }).catch((error: string) => {
      return {
        count,
        topic,
        error
      }
    });
  }
}
