const STOPWORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'aren\'t',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can\'t',
  'cannot',
  'could',
  'couldn\'t',
  'did',
  'didn\'t',
  'do',
  'does',
  'doesn\'t',
  'doing',
  'don\'t',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'hadn\'t',
  'has',
  'hasn\'t',
  'have',
  'haven\'t',
  'having',
  'he',
  'he\'d',
  'he\'ll',
  'he\'s',
  'her',
  'here',
  'here\'s',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'how\'s',
  'i',
  'i\'d',
  'i\'ll',
  'i\'m',
  'i\'ve',
  'if',
  'in',
  'into',
  'is',
  'isn\'t',
  'it',
  'it\'s',
  'its',
  'itself',
  'let\'s',
  'me',
  'more',
  'most',
  'mustn\'t',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'shan\'t',
  'she',
  'she\'d',
  'she\'ll',
  'she\'s',
  'should',
  'shouldn\'t',
  'so',
  'some',
  'such',
  'than',
  'that',
  'that\'s',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'there\'s',
  'these',
  'they',
  'they\'d',
  'they\'ll',
  'they\'re',
  'they\'ve',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'wasn\'t',
  'we',
  'we\'d',
  'we\'ll',
  'we\'re',
  'we\'ve',
  'were',
  'weren\'t',
  'what',
  'what\'s',
  'when',
  'when\'s',
  'where',
  'where\'s',
  'which',
  'while',
  'who',
  'who\'s',
  'whom',
  'why',
  'why\'s',
  'with',
  'won\'t',
  'would',
  'wouldn\'t',
  'you',
  'you\'d',
  'you\'ll',
  'you\'re',
  'you\'ve',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'http',
  'https',
  'com',
  'gov',
  'net',
  'co',
  // NYC specific
  'ny',
  'new',
  'york',
  'nyc',
  'thi',
]);

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
        let word = match[0].toLowerCase();
        if (word.endsWith('s')) {
          word = word.slice(0, word.length - 1);
        } else if (word.endsWith('es')) {
          word = word.slice(0, word.length - 2);
        }
        if (STOPWORDS.has(word)) continue;
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
