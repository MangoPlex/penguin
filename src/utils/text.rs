pub const COLOR_UP: u32 = 0xED4245;
pub const COLOR_DOWN: u32 = 0x57F287;
pub const COLOR_NEUTRAL: u32 = 0x99AAB5;

pub fn format_vnd(price: i64) -> String {
    let digits = price.to_string();
    let mut grouped = String::new();

    for (i, c) in digits.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            grouped.push('.');
        }
        grouped.push(c);
    }

    grouped.chars().rev().collect()
}

/// Renders a price change as `(text, color)`, where color follows Discord's
/// red/green/grey convention for increase/decrease/no change.
pub fn format_change(prev: i64, curr: i64, unit: &str) -> (String, u32) {
    match curr - prev {
        0 => ("Không đổi".to_owned(), COLOR_NEUTRAL),
        diff if diff > 0 => (format!("🔺 {} {unit}", format_vnd(diff)), COLOR_UP),
        diff => (format!("🔽 {} {unit}", format_vnd(-diff)), COLOR_DOWN),
    }
}
