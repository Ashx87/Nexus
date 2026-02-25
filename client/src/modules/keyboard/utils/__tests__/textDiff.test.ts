import { computeTextDiff } from '../textDiff';

describe('computeTextDiff', () => {
  it('detects added characters at the end', () => {
    expect(computeTextDiff('hel', 'hello')).toEqual({ added: 'lo', deletedCount: 0 });
  });

  it('detects deleted characters from the end', () => {
    expect(computeTextDiff('hello', 'hel')).toEqual({ added: '', deletedCount: 2 });
  });

  it('handles same-length replacement', () => {
    // 'lo' deleted after prefix 'hel', then 'p' added → deletedCount: 2
    expect(computeTextDiff('hello', 'help')).toEqual({ added: 'p', deletedCount: 2 });
  });

  it('handles mid-string replacement with length change', () => {
    // 'ello' deleted after prefix 'h', then 'i' added
    expect(computeTextDiff('hello', 'hi')).toEqual({ added: 'i', deletedCount: 4 });
  });

  it('handles empty string to text', () => {
    expect(computeTextDiff('', 'hi')).toEqual({ added: 'hi', deletedCount: 0 });
  });

  it('handles text to empty string', () => {
    expect(computeTextDiff('hi', '')).toEqual({ added: '', deletedCount: 2 });
  });

  it('handles no change', () => {
    expect(computeTextDiff('hi', 'hi')).toEqual({ added: '', deletedCount: 0 });
  });

  it('handles emoji appended', () => {
    expect(computeTextDiff('a', 'a😀')).toEqual({ added: '😀', deletedCount: 0 });
  });
});
