export function genPattern(number) {
  const patternArray = [];

  while (number > 0) {
    patternArray.push(number === 1 ? '*' : number === 2 ? '**' : '***');
    number -= 3;
    if (number <= patternArray.length) {
      for (let i = 0; i < number; i++) {
        patternArray[patternArray.length - i - 1] += '*';
      }
      break;
    }
  }

  return patternArray.join(' ');
}

export function formatAccount(str, pattern) {
  str = `${str}`.replace(/\s+/g, '');

  if (str.length <= 5 && !pattern) return str;
  let result = '';

  pattern = pattern || genPattern(str.length);

  for (let i = 0, j = 0; i < str.length; i++) {
    result += str[i];
    if (pattern[++j] === ' ') {
      result += ' ';
      j++;
    }
  }

  return result;
}
