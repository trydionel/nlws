import PcgRandom from 'pcg-random';

export const Random = new PcgRandom();

export function sample<T>(array: T[]): T {
  const n = Random.integer(array.length);
  return array[n];
}
