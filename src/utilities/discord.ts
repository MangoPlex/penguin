export function extractUrls(text: string): Array<[string, boolean]> {
  const spoilerPattern = /\|\|(https?:\/\/[^\s|]+)\|\|/g;
  const regularPattern = /(?<!\$)(https?:\/\/[^\s]+)/g;

  // Find spoiler URLs
  const spoilerUrls: Array<[string, boolean]> = Array.from(
    text.matchAll(spoilerPattern),
    (match) => (match[1] !== undefined ? [match[1], true] : undefined),
  ).filter((item): item is [string, boolean] => item !== undefined);

  // Remove spoilers and find regular URLs
  const textWithoutSpoilers = text.replace(spoilerPattern, "");
  const regularUrls: Array<[string, boolean]> = Array.from(
    textWithoutSpoilers.matchAll(regularPattern),
    (match) => (match[1] !== undefined ? [match[1], false] : undefined),
  ).filter((item): item is [string, boolean] => item !== undefined);

  return [...spoilerUrls, ...regularUrls];
}
