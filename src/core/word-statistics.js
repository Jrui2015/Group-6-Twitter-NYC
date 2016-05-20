class WordFrequency {
  static wordRegex = /[@#]?[\w][\w-_']+/gi;

  constructor() {
    this.freqs = new Map();
  }

  add(string, freq = 1) {
    let match;
    do {
      match = WordFrequency.wordRegex.exec(string);
      if (match) {
        const word = match[0];
        if (!this.freqs.get(word)) {
          this.freqs.set(word, freq);
        } else {
          const old = this.freqs.get(word);
          this.freqs.set(word, old + freq);
        }
      }
    } while (match);
    return this;
  }

  union(other) {
    const unioned = new WordFrequency();
    [this.freqs, other.freqs].forEach(fqs => {
      fqs.forEach((freq, word) => {
        unioned.add(word, freq);
      });
    });
    return unioned;
  }
}

export default WordFrequency;
