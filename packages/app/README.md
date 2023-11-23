# @fontjam/app

## Architecture Notes

### Google Fonts

There are currently two working methods of obtaining Google Fonts data:

- Using the Google Fonts API
- Using our API

Our api, in the `packages/api` directory, parses every
`METADATA.pb` file in a locally-cloned Google Fonts
repository. The advantage of this is by far a superior
dataset.

With the Google Fonts API, it's almost impossible to
determine `postscriptName` and `style`/`variation`.

### Adapters

Every library type in the database should have a
cooresponding Adapter class that implements the Adapter
interface. They can also optionally inherit from the
"CommonAdapter" for, you guessed it, common/shared functionality.
