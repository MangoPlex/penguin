import type { Events, Message } from "discord.js";
import { extractUrls } from "../../utilities/discord.js";
import {
  checkUrlDomain,
  removeQueryParams,
  replaceDomain,
} from "../../utilities/url.js";
import { type ArgsOf, Discord, On } from "discordx";

@Discord()
export class EmbedFixerEventHandler {
  @On()
  messageCreate([message]: ArgsOf<Events.MessageCreate>): void {
    applyFix(message);
  }
}

enum MediaProvider {
  Facebook = "facebook",
  Instgram = "instagram",
  Threads = "threads",
  Tiktok = "tiktok",
  Reddit = "reddit",
}

class MediaEmbedReplaceFix {
  public originalDomain: string;
  public replacementDomain: string;

  constructor(originalDomain: string, replacementDomain: string) {
    this.originalDomain = originalDomain;
    this.replacementDomain = replacementDomain;
  }
}

class MediaEmbedFixer {
  public provider: MediaProvider;
  public urls: RegExp[];
  public fixes: MediaEmbedReplaceFix[];

  constructor(
    provider: MediaProvider,
    urls: RegExp[] = [],
    fixes: MediaEmbedReplaceFix[] = [],
  ) {
    this.provider = provider;
    this.urls = urls;
    this.fixes = fixes;
  }

  public matchUrl(url: string): boolean {
    return this.urls.some((pattern) => pattern.test(url));
  }
}

const MEDIA_EMBED_FIXERS: MediaEmbedFixer[] = [
  new MediaEmbedFixer(
    MediaProvider.Facebook,
    [
      /https:\/\/(www\.)?facebook\.com\/(.*)/,
      /https:\/\/(www\.)?facebook\.com\/share\/r\/[\w]+\/?/,
      /https:\/\/(www\.)?facebook\.com\/reel\/\d+\/?/,
      /https:\/\/(www\.)?facebook\.com\/share\/v\/[\w]+\/?/,
    ],
    [new MediaEmbedReplaceFix("facebook.com", "facebed.com")],
  ),
  new MediaEmbedFixer(
    MediaProvider.Instgram,
    [
      /https:\/\/(www\.)?instagram\.com\/share\/[\w]+\/?/,
      /https:\/\/(www\.)?instagram\.com\/(p|reels?)\/[\w]+\/?/,
      /https:\/\/(www\.)?instagram\.com\/share\/(p|reels?)\/[\w]+\/?/,
    ],
    [new MediaEmbedReplaceFix("instagram.com", "kkinstagram.com")],
  ),
  new MediaEmbedFixer(
    MediaProvider.Threads,
    [
      /https:\/\/(www\.)?threads\.(net|com)\/@[\w.]+\/?/,
      /https:\/\/(www\.)?threads\.(net|com)\/@[\w.]+\/post\/[\w]+\/?/,
    ],
    [
      new MediaEmbedReplaceFix("threads.net", "fixthreads.net"),
      new MediaEmbedReplaceFix("threads.com", "fixthreads.net"),
    ],
  ),
  new MediaEmbedFixer(
    MediaProvider.Tiktok,
    [
      /https:\/\/(www\.)?tiktok\.com\/(t\/\w+|@[\w.]+\/video\/\d+)\/?/,
      /https:\/\/vm\.tiktok\.com\/\w+\/?/,
      /https:\/\/vt\.tiktok\.com\/\w+\/?/,
    ],
    [new MediaEmbedReplaceFix("tiktok.com", "a.tnktok.com")],
  ),
  new MediaEmbedFixer(
    MediaProvider.Reddit,
    [
      /https:\/\/(www\.|old\.)?reddit\.com\/r\/[\w]+\/comments\/[\w]+\/[\w]+\/?/,
      /https:\/\/(www\.|old\.)?reddit\.com\/r\/[\w]+\/s\/[\w]+\/?/,
      /https:\/\/(www\.|old\.)?reddit\.com\/user\/[\w]+\/comments\/[\w]+\/[\w]+\/?/,
    ],
    [new MediaEmbedReplaceFix("reddit.com", "rxddit.com")],
  ),
];

function findEmbedFixer(url: string): MediaEmbedFixer | null {
  return MEDIA_EMBED_FIXERS.find((fixer) => fixer.matchUrl(url)) ?? null;
}

function applyFix(message: Message): void {
  const urls = extractUrls(message.content);

  // No need to proceed if no URLs found
  if (urls.length === 0) return;

  const fixed_urls: string[] = [];

  for (const _url of urls) {
    const url = _url[0];
    let cleanUrl: string;
    try {
      cleanUrl = removeQueryParams(url).replace("www.", "");
    } catch {
      console.warn(`Failed to parse URL during apply embed fix: ${url}`);
      continue;
    }

    const fixer = findEmbedFixer(cleanUrl);
    if (!fixer) continue;

    for (const fix of fixer.fixes) {
      if (checkUrlDomain(cleanUrl, fix.originalDomain)) {
        const new_url = replaceDomain(cleanUrl, fix.replacementDomain);
        fixed_urls.push(new_url);
      }
    }
  }

  // Only proceed if we have fixed URLs and valid channel
  if (fixed_urls.length > 0 && message.channel && "send" in message.channel) {
    message.suppressEmbeds(true);

    message.reply({
      content: fixed_urls
        .map((url) => `[Preview Embed URL](${url})`)
        .join("\n"),
      allowedMentions: { repliedUser: false },
    });
  }
}
