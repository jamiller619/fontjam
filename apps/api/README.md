# @fontjam/api

## Why?

Currently, the Google Fonts HTTP API only provides a small
subset of the available data while their Github repo provides everything we need, but at nearly 5GB, the data set is simply too large for a desktop app for fonts.

In the Google Fonts repo, we're solely interested in the
`METADATA.pb` files that accompany every font in the catalog.
