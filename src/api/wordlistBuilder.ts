import sample from 'lodash/sample';

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
  'school'
];

export class WordlistBuilder {
  async get(count: number): Promise<string[]> {
    const topic = sample(Topics);
    const result = fetch(`https://api.datamuse.com/words?rel_trg=${topic}&max=100`);
    return result.then(response => {
      return response.json();
    }).then((json: DatamuseWord[]) => {
      const selected = new Set();
      while (selected.size < 10) {
        const entry = sample(json) as DatamuseWord;
        const word = entry.word;
        if (word.length < 8) {
          selected.add(word);
        }
      }

      return Array.from(selected);
    });
  }
}