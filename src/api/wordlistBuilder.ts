const Words = [
  'banana',
  'apple',
  'pear',
  'zucchini'
];

export class WordlistBuilder {
  get(count: number): string[] {
    return Words;
  }
}