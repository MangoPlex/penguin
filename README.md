# PENGUIN

`penguin` is installed on Alpine Linux as a locally built APK package. Docker
is not required or supported.

## Build and install on Alpine

Run these commands from a checkout of the `v1.2.4` tag (or the corresponding
version in `APKBUILD`):

```sh
doas apk add abuild build-base cargo cmake openssl opus-dev pkgconf rust
doas adduser "$USER" abuild
abuild-keygen -a -i
abuild -r
doas apk add --allow-untrusted ~/packages/"$(uname -m)"/penguin-1.2.4-r0.apk
```

`abuild -r` downloads the tagged source, builds it with Alpine's native Rust
toolchain, runs the test suite, and writes the APK to `~/packages/`.
Log out and back in after adding yourself to the `abuild` group if the group
membership is not active in the current shell.

## Run

The package installs the executable at `/usr/bin/penguin`. Supply the required
Discord credentials through the environment before starting it:

```sh
export DISCORD_TOKEN='your-discord-token'
export GUILD_ID='your-discord-guild-id'
penguin
```

The package deliberately does not create a user, install an OpenRC service, or
store credentials. Choose the process supervisor and secret-management method
appropriate for the host.

## Tagged GitHub releases

Pushing a tag named `v<version>` starts the GitHub Actions workflow. It builds
the APK in Alpine and attaches the resulting package to a GitHub Release. The
tag must match `pkgver` in `APKBUILD`; update both before tagging a new version.
