export function wrapSelection(
  value: string,
  start: number,
  end: number,
  prefix: string,
  suffix = prefix,
  placeholder = "văn bản",
) {
  const selected = value.slice(start, end) || placeholder;
  return {
    value: value.slice(0, start) + prefix + selected + suffix + value.slice(end),
    start: start + prefix.length,
    end: start + prefix.length + selected.length,
  };
}
export function mentionQuery(value: string, caret: number) {
  const match = /(?:^|\s)@([\w-]*)$/.exec(value.slice(0, caret));
  return match
    ? { query: match[1].toLowerCase(), start: caret - match[1].length - 1, end: caret }
    : null;
}
export function insertMention(
  value: string,
  start: number,
  end: number,
  login: string,
  userId: string,
) {
  const token = `[@${login}](mention:${userId}) `;
  return { value: value.slice(0, start) + token + value.slice(end), caret: start + token.length };
}
