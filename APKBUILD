# Maintainer: MangoPlex <38831897+justmangoou@users.noreply.github.com>
pkgname=penguin
pkgver=1.2.6
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
# This private package is built from the checked-out repository, not a
# separately distributed source archive.
builddir="$startdir"

build() {
	cargo build --frozen --release
}

check() {
	cargo test --frozen
}

package() {
	install -Dm755 target/release/$pkgname "$pkgdir/usr/bin/$pkgname"
}
