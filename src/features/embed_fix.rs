use std::sync::LazyLock;

use poise::serenity_prelude::{CreateMessage, Message};
use regex_lite::Regex;

use crate::utils::url::{extract_urls_from_message, remove_query_params, replace_domain};

struct MediaEmbedFixer {
    urls: Vec<Regex>,
    replacement_domain: &'static str,
}

impl MediaEmbedFixer {
    fn new(patterns: &[&str], replacement_domain: &'static str) -> Self {
        Self {
            urls: patterns.iter().map(|p| Regex::new(p).unwrap()).collect(),
            replacement_domain,
        }
    }

    fn match_url(&self, url: &str) -> bool {
        self.urls.iter().any(|regex| regex.is_match(url))
    }
}

static MEDIA_EMBED_FIXES: LazyLock<Vec<MediaEmbedFixer>> = LazyLock::new(|| {
    vec![
        MediaEmbedFixer::new(
            &[
                r"^https://(www\.)?facebook\.com/(.*)",
                r"^https://(www\.)?facebook\.com/share/r/[\w]+/?",
                r"^https://(www\.)?facebook\.com/reel/\d+/?",
                r"^https://(www\.)?facebook\.com/share/v/[\w]+/?",
            ],
            "facebed.justmangoou.dev",
        ),
        MediaEmbedFixer::new(
            &[
                r"^https://(www\.)?instagram\.com/share/[\w]+/?",
                r"^https://(www\.)?instagram\.com/(p|reels?)/[\w]+/?",
                r"^https://(www\.)?instagram\.com/share/(p|reels?)/[\w]+/?",
            ],
            "kkinstagram.com",
        ),
        MediaEmbedFixer::new(
            &[
                r"^https://(www\.)?threads\.(net|com)/@[\w.]+/?",
                r"^https://(www\.)?threads\.(net|com)/@[\w.]+/post/[\w]+/?",
            ],
            "fixthreads.net",
        ),
        MediaEmbedFixer::new(
            &[
                r"^https://(www\.)?tiktok\.com/(t/\w+|@[\w.]+/video/\d+)/?",
                r"^https://vm\.tiktok\.com/\w+/?",
                r"^https://vt\.tiktok\.com/\w+/?",
            ],
            "a.tnktok.com",
        ),
        MediaEmbedFixer::new(
            &[
                r"^https://(www\.|old\.)?reddit\.com/r/[\w]+/comments/[\w]+/[\w]+/?",
                r"^https://(www\.|old\.)?reddit\.com/r/[\w]+/s/[\w]+/?",
                r"^https://(www\.|old\.)?reddit\.com/user/[\w]+/comments/[\w]+/[\w]+/?",
            ],
            "rxddit.com",
        ),
    ]
});

fn find_embed_fixer(url: &str) -> Option<&'static MediaEmbedFixer> {
    MEDIA_EMBED_FIXES.iter().find(|f| f.match_url(url))
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

        if let Some(new_url) = replace_domain(&clean_url, fixer.replacement_domain) {
            fixed_urls.push(new_url);
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
