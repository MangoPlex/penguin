import type { Events, Message } from "discord.js";
import { extractUrls } from "../../utilities/discord.js";
import {
  checkUrlDomain,
  removeQueryParams,
  replaceDomain,
} from "../../utilities/url.js";
import { ArgsOf, Discord, On } from "discordx";

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
  Tiktok = "tiktok",
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
    for (const urlPattern of this.urls) {
      const regex = new RegExp(urlPattern);
      if (regex.test(url)) {
        return true;
      }
    }
    return false;
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
    MediaProvider.Tiktok,
    [
      /https:\/\/(www\.)?tiktok\.com\/(t\/\w+|@[\w.]+\/video\/\d+)\/?/,
      /https:\/\/vm\.tiktok\.com\/\w+\/?/,
      /https:\/\/vt\.tiktok\.com\/\w+\/?/,
    ],
    [new MediaEmbedReplaceFix("tiktok.com", "a.tnktok.com")],
  ),
];

function findEmbedFixer(url: string): MediaEmbedFixer | null {
  for (const fixer of MEDIA_EMBED_FIXERS) {
    if (fixer.matchUrl(url)) {
      return fixer;
    }
  }

  return null;
}

function applyFix(message: Message): void {
  let content = message.content;
  let urls = extractUrls(content);

  for (let _url of urls) {
    let url = _url[0];
    let cleanUrl;
    try {
      cleanUrl = removeQueryParams(url).replace("www.", "");
    } catch {
      continue;
    }

    const fixer = findEmbedFixer(cleanUrl);
    if (fixer === null) continue;

    for (const fix of fixer.fixes) {
      if (!checkUrlDomain(cleanUrl, fix.originalDomain)) continue;
      let new_url = replaceDomain(cleanUrl, fix.replacementDomain);

      if (
        message.channel &&
        message.channel.isTextBased() &&
        "send" in message.channel
      ) {
        message.channel.send(`${new_url}`);
      }
    }
  }
}
