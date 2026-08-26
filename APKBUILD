# Maintainer: MangoPlex <38831897+justmangoou@users.noreply.github.com>
pkgname=penguin
pkgver=1.2.5
pkgrel=0
pkgdesc="Our server Discord bot"
url="https://github.com/MangoPlex/penguin"
arch="all"
license="custom"
makedepends="
	build-base
	cargo
	cmake
	opus-dev
	pkgconf
	rust
"
depends="opus"
source="$pkgname-$pkgver.tar.gz::https://github.com/MangoPlex/penguin/archive/refs/tags/v$pkgver.tar.gz"
builddir="$srcdir/$pkgname-$pkgver"

build() {
	cargo build --frozen --release
}

check() {
	cargo test --frozen
}

package() {
	install -Dm755 target/release/$pkgname "$pkgdir/usr/bin/$pkgname"
}

sha512sums="
10d458bcc3c0702bec82be4b6f2064b21311cd81dbf8e30222bafd3db0c53a57e1872c0eac6d3e61544eb57b2a65838a47d87343380a139c9acef7ba69f7b5eb  penguin-1.2.4.tar.gz
"
