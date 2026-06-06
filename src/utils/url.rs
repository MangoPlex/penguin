use std::sync::LazyLock;

use regex_lite::Regex;
use url::Url;

use crate::Result;

static SPOILER_URL_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\|\|(https?://[^\s|]+)\|\|").unwrap());

static URL_REGEX: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"(https?://[^\s|]+)").unwrap());

pub fn extract_urls_from_message(message: &str) -> Vec<(String, bool)> {
    let mut urls = Vec::new();
    let mut remaining_message = message;

    while let Some(mat) = SPOILER_URL_REGEX.find(remaining_message) {
        urls.push((mat.as_str()[2..mat.as_str().len() - 2].to_string(), true));
        remaining_message = &remaining_message[mat.end()..];
    }

    while let Some(mat) = URL_REGEX.find(remaining_message) {
        urls.push((mat.as_str().to_string(), false));
        remaining_message = &remaining_message[mat.end()..];
    }

    urls
}

pub fn remove_query_params(url: &str) -> Result<String> {
    Url::parse(url)
        .map(|mut parsed_url| {
            parsed_url.set_query(None);
            parsed_url.to_string()
        })
        .map_err(|e| {
            eprintln!("Invalid URL provided: {}", url);
            e.into()
        })
}

pub fn check_url_domain(url: &str, domain: &str) -> bool {
    match Url::parse(url) {
        Ok(parsed_url) => {
            if let Some(hostname) = parsed_url.host_str() {
                hostname == domain || hostname.ends_with(&format!(".{}", domain))
            } else {
                false
            }
        }
        Err(_) => {
            eprintln!("Invalid URL provided: {}", url);
            false
        }
    }
}

pub fn replace_domain(url: &str, new_domain: &str) -> Option<String> {
    match Url::parse(url) {
        Ok(mut parsed_url) => {
            if parsed_url.set_host(Some(new_domain)).is_ok() {
                Some(parsed_url.to_string())
            } else {
                eprintln!("Failed to set new domain: {}", new_domain);
                None
            }
        }
        Err(_) => {
            eprintln!("Invalid URL provided: {}", url);
            None
        }
    }
}
