export function extractUrls(text: string): Array<[string, boolean]> {
  const spoilerPattern = /\|\|(https?:\/\/[^\s|]+)\|\|/g;
  const regularPattern = /(https?:\/\/[^\s]+)/g;

  const urls: Array<[string, boolean]> = [];

  // Find spoiler URLs first
  let match: RegExpExecArray | null;
  while ((match = spoilerPattern.exec(text)) !== null) {
    urls.push([match[1], true]);
  }

  // Remove spoilers from text to avoid double-matching
  const textWithoutSpoilers = text.replace(spoilerPattern, "");

  // Find regular URLs
  while ((match = regularPattern.exec(textWithoutSpoilers)) !== null) {
    urls.push([match[1], false]);
  }

  return urls;
}
