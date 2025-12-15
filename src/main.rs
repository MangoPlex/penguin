#[tokio::main]
async fn main() {
    penguin::setup()
        .await
        .start()
        .await
        .expect("Failed to start client");
}
