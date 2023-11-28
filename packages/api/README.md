# @fontjam/api

## Why?

Currently, the Google Fonts HTTP API only provides a small
subset of the available data while their git repo on
Github, provides everything we need, albeit in an almost 5GB
repository. And neither of these options worked for a
desktop app.

In the Google Fonts repo, we're solely interested in the
`METADATA.pb` files that accompany every font in the catalog.

## Look ma, no `dotenv`!

Nope, we're using the [native Node.js handling for .env
files](https://nodejs.org/en/blog/release/v20.6.0), released in version v20.6.0.
