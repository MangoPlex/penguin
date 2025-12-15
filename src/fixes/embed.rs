use poise::serenity_prelude::{CreateMessage, Message};
use regex_lite::Regex;
use std::sync::LazyLock;

use crate::utils::url::{
    check_url_domain, extract_urls_from_message, remove_query_params, replace_domain,
};

static MEDIA_EMBED_FIXES: LazyLock<Vec<MediaEmbedFixer>> = LazyLock::new(|| {
    vec![
        MediaEmbedFixer {
            provider: MediaProvider::Facebook,
            urls: vec![
                Regex::new(r"https://(www\.)?facebook\.com/(.*)").unwrap(),
                Regex::new(r"https://(www\.)?facebook\.com/share/r/[\w]+/?").unwrap(),
                Regex::new(r"https://(www\.)?facebook\.com/reel/\d+/?").unwrap(),
                Regex::new(r"https://(www\.)?facebook\.com/share/v/[\w]+/?").unwrap(),
            ],
            fixes: vec![MediaEmbedReplaceFix::new("facebook.com", "facebed.com")],
        },
        MediaEmbedFixer {
            provider: MediaProvider::Instagram,
            urls: vec![
                Regex::new(r"https://(www\.)?instagram\.com/share/[\w]+/?").unwrap(),
                Regex::new(r"https://(www\.)?instagram\.com/(p|reels?)/[\w]+/?").unwrap(),
                Regex::new(r"https://(www\.)?instagram\.com/share/(p|reels?)/[\w]+/?").unwrap(),
            ],
            fixes: vec![MediaEmbedReplaceFix::new(
                "instagram.com",
                "kkinstagram.com",
            )],
        },
        MediaEmbedFixer {
            provider: MediaProvider::Threads,
            urls: vec![
                Regex::new(r"https://(www\.)?threads\.(net|com)/@[\w.]+/?").unwrap(),
                Regex::new(r"https://(www\.)?threads\.(net|com)/@[\w.]+/post/[\w]+/?").unwrap(),
            ],
            fixes: vec![
                MediaEmbedReplaceFix::new("threads.com", "fixthreads.net"),
                MediaEmbedReplaceFix::new("threads.net", "fixthreads.net"),
            ],
        },
        MediaEmbedFixer {
            provider: MediaProvider::Tiktok,
            urls: vec![
                Regex::new(r"https://(www\.)?tiktok\.com/(t/\w+|@[\w.]+/video/\d+)/?").unwrap(),
                Regex::new(r"https://vm\.tiktok\.com/\w+/?").unwrap(),
                Regex::new(r"https://vt\.tiktok\.com/\w+/?").unwrap(),
            ],
            fixes: vec![MediaEmbedReplaceFix::new("tiktok.com", "a.tnktok.com")],
        },
        MediaEmbedFixer {
            provider: MediaProvider::Reddit,
            urls: vec![
                Regex::new(r"https://(www\.|old\.)?reddit\.com/r/[\w]+/comments/[\w]+/[\w]+/?")
                    .unwrap(),
                Regex::new(r"https://(www\.|old\.)?reddit\.com/r/[\w]+/s/[\w]+/?").unwrap(),
                Regex::new(r"https://(www\.|old\.)?reddit\.com/user/[\w]+/comments/[\w]+/[\w]+/?")
                    .unwrap(),
            ],
            fixes: vec![MediaEmbedReplaceFix::new("reddit.com", "rxddit.com")],
        },
    ]
});

enum MediaProvider {
    Facebook,
    Instagram,
    Threads,
    Tiktok,
    Reddit,
}

struct MediaEmbedReplaceFix {
    original_domain: String,
    replacement_domain: String,
}

impl MediaEmbedReplaceFix {
    fn new(original: &str, replacement: &str) -> Self {
        Self {
            original_domain: original.to_owned(),
            replacement_domain: replacement.to_owned(),
        }
    }
}

struct MediaEmbedFixer {
    #[allow(dead_code)]
    provider: MediaProvider,
    urls: Vec<Regex>,
    fixes: Vec<MediaEmbedReplaceFix>,
}

impl MediaEmbedFixer {
    pub fn match_url(&self, url: &str) -> bool {
        for regex in &self.urls {
            if regex.is_match(url) {
                return true;
            }
        }

        false
    }
}

fn find_embed_fixer(url: &str) -> Option<&'static MediaEmbedFixer> {
    for fixer in MEDIA_EMBED_FIXES.iter() {
        if fixer.match_url(url) {
            return Some(fixer);
        }
    }

    None
}

pub async fn apply_fix(message: &mut Message, http: &poise::serenity_prelude::Http) {
    let urls = extract_urls_from_message(&message.content);

    if urls.is_empty() {
        return;
    }

    let mut fixed_urls: Vec<String> = Vec::new();

    for url in urls {
        let clean_url = match remove_query_params(&url.0) {
            Ok(u) => u.replace("www.", ""),
            Err(_) => continue,
        };

        let fixer = match find_embed_fixer(&clean_url) {
            Some(f) => f,
            None => continue,
        };

        for fix in &fixer.fixes {
            if check_url_domain(&clean_url, &fix.original_domain) {
                if let Some(new_url) = replace_domain(&clean_url, &fix.replacement_domain) {
                    fixed_urls.push(new_url);
                }
            }
        }
    }

    if !fixed_urls.is_empty() {
        use poise::serenity_prelude::{EditMessage, MessageFlags};
        let edit = EditMessage::new().flags(MessageFlags::SUPPRESS_EMBEDS);
        if let Err(e) = message.edit(http, edit).await {
            eprintln!("Failed to suppress embeds: {}", e);
        }

        let content = fixed_urls
            .iter()
            .map(|url| format!("[Preview Embed URL]({})", url))
            .collect::<Vec<String>>()
            .join("\n");

        let reply = CreateMessage::new()
            .content(content)
            .reference_message(&*message)
            .allowed_mentions(
                poise::serenity_prelude::CreateAllowedMentions::new().replied_user(false),
            );

        if let Err(e) = message.channel_id.send_message(http, reply).await {
            eprintln!("Failed to send embed fix reply: {}", e);
        }
    }
}
