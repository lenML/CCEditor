### `first_mes`

First message sent by the chatbot, also known as "greeting."

The chatbot **MUST** be the first one to send a message, and that message
**MUST** be the string inside `first_mes`.

### `mes_example`

Example conversations. It **MUST** be expected that botmakers format example
conversations like this:

```
<START>
{{user}}: hi
{{char}}: hello
<START>
{{user}}: hi
Haruhi: hello
```

`<START>` marks the beginning of a new conversation and **MAY** be transformed
(e.g. into an OpenAI System message saying "Start a new conversation.")

Example conversations **SHOULD**, by default, only be included in the prompt
until actual conversation fills up the context size, and then be pruned to make
room for actual conversation history. This behavior **MAY** be configurable by the user.

### `creator_notes`

The value for this field **MUST NOT** be used inside prompts. The value for this field **SHOULD** be very discoverable for bot users (at least one paragraph **SHOULD** be displayed).

### `system_prompt`

Frontends' default behavior **MUST** be to replace what users understand to be the "system prompt" global setting with the value inside this field. (Exception: if the field value is an empty string, the user's "system prompt" setting or an internal fallback **MUST** be used.)

Frontends **MUST** support the `{{original}}` placeholder, which is replaced with the "system prompt" string that the frontend would have used in the absence of a character `system_prompt` (e.g. the user's own system prompt).

Frontends **MAY** offer ways to replace or supplement character cards' system prompt (in addition to directly editing the card), but it **MUST NOT** be the default behavior.

### `post_history_instructions`

Frontends' default behavior **MUST** be to replace what users understand to be the "ujb/jailbreak" setting with the value inside this field. (Exception: if the field value is an empty string, the user's "ujb/jailbreak" setting or an internal fallback **MUST** be used.)

Frontends **MUST** support the `{{original}}` placeholder, which is replaced with the "ujb/jailbreak" string that the frontend would have used in the absence of a character `system_prompt` (e.g. the user's own ujb/jailbreak).

Frontends **MAY** offer ways to replace or supplement character cards' post_history_instructions (in addition to directly editing the card), but it **MUST NOT** be the default behavior.

### `alternate_greetings`

Array of strings.

Frontends **MUST** offer "swipes" on character first messages, each string inside this array being an additional "swipe".

### `character_book`

A character-specific lorebook.

Find the typing for this field in the [New fields intro](#new-fields).

Frontends **MUST** use the character lorebook by default.

Character editors **MUST** save character lorebooks in the specified format.

Character lorebook **SHOULD** stack with user "world book"/"world info"/"memory book". (Character book **SHOULD** take full precedence over world book.)

### `tags`

An array of strings.

There is no restriction on what strings are valid.

This field **SHOULD NOT** be used in the prompt engineering.

This field **MAY** be used for frontend sorting/filtering purposes (**SHOULD** be
case-insensitive).

### `creator`

This field **MUST NOT** be used for prompt engineering.

This field **MAY** be shown on frontends.

### `character_version`

This field **MUST NOT** be used for prompt engineering.

This field **MAY** be shown on frontends and used for sorting.

### `extensions`

This field **MUST** default to an empty object (`{}`).

This field **MAY** contain any arbitrary JSON key-value pair.

### `character_book`

The value of this field _MUST_ be a Lorebook object or undefined. if this field is present, the application _SHOULD_ consider this field as a character specific lorebook. applications MUST use the character lorebook by default and Character editors MUST save character lorebooks in the specified format. Character lorebook _SHOULD_ stacked with can be defined as a global lorebook.

### `creator_notes`

The value of this field _MUST_ be a string. this value _MUST_ considered as creator notes if `creator_notes_multilingual` is undefined. if `creator_notes_multilingual` is present, the application _SHOULD_ considered this as a creator note for `en` language, if `creator_notes_multilingual` does not have a key for `en` language. if is not, the application _SHOULD_ ignore this field.

### `nickname`

The value of this field _MUST_ be a string or undefined. if the value is present, the syntax `{{char}}`, `<char>` and `<bot>` _SHOULD_ be replaced with the value of this field in the prompt instead of the `name` field.

### `creator_notes_multilingual`

The value of this field _MUST_ be a object or undefined. if this field is present, the application _MUST_ consider this field as a multilingual creator notes. the key of the object _MUST_ be a language code in ISO 639-1, without region code. the value of the object _MUST_ be a string. the application _SHOULD_ display the creator notes in the language that the user's client is set to. the application _MAY_ provide language selection for creator notes.

### `source`

the value of this field _MUST_ be a array string or undefined. if the value is present, the application _SHOULD_ determine as an array of the ID or a HTTP/HTTPS URL that points to the source of the character card.

The field _SHOULD NOT_ be editable by the user. If the `source` is a URI, the application _MAY_ provide a way to open the value of the `source` field in a new tab.

applications _SHOULD_ only append elements to the `source` field and _SHOULD NOT_ remove or modify the elements in the `source` field if the element isn't added by application. elements appended by application _MAY_ be editable by the application.

However, if it significantly slows down the application, or it makes the application hard to use, or the source is harmful, the application _MAY_ remove the elements in the `source` field. if the application removes the elements in the `source` field, the application _SHOULD_ alert the user that the source is removed.

### `assets`

The value of this field _MUST_ be an array of objects or undefined. if this field is undefined, the application _MUST_ behave as if the value is this array:

```ts
[
  {
    type: "icon",
    uri: "ccdefault:",
    name: "main",
    ext: "png",
  },
];
```

the value _SHOULD_ be determine as an array of character's assets. the object _MUST_ have a `type` field and a `uri` field and a `name` field and a `uri` ext. the `type` field _MUST_ be a string, and the `uri` field _MUST_ be a string. the `type` field _MUST_ be a type of the asset. the `uri` field _MUST_ be a HTTP or HTTPS URL of the asset or base64 data URL or 'path for embedded assets' or `ccdefault:`. how the path for embedded assets formated _SHOULD_ follow this format: `embeded://path/to/asset.png`. this format is case sensitive, and sepearated by `/`. if the URI field is `ccdefault:`, the application _SHOULD_ use the default asset for the type. how the default asset is determined is up to the application except it is specified in the specification. if the URI field is HTTP or HTTPS URL or base64 data URL, the application _SHOULD_ use the asset from the URL. applications _MAY_ ignore elements with HTTP url in the `uri` which isn't HTTPS for security reasons. applications _MAY_ check if the asset URI is valid and the asset is accessible. applications _MAY_ ignore base64 data URLs if the application does not support the format of the asset, or the asset is too large. applications _MAY_ add more URI type support like `file://`, `ftp://` etc. but the URI type _SHOULD_ be a valid URI type. and if the URI type is not supported by the application, the application _MAY_ ignore the asset. however, the application _SHOULD_ support `embeded://` and `ccdefault:` URI types which are defined in the specification.

Where the each assets would be used is determined by the `type` field.

- If the `type` field is `icon`, the asset _SHOULD_ be used as an icon or protrait of the character. if one of the assets is `icon` type, the application _SHOULD_ use the asset as the icon of the character card. if there is multiple `icon` type assets, the application _SHOULD_ use the main icon or let the user choose the icon, or change dynamically by the application. how the main icon choosed is below on the specification. if `uri` field is `ccdefault:`, and the card is PNG/APNG embedded, `ccdefault:` _SHOULD_ point the PNG/APNG file itself or modified version of the PNG/APNG file.
- If the `type` field is `background`, the asset _SHOULD_ be used as a background of the character card. if one of the assets is `background` type, the application _SHOULD_ use the asset as the background of the character card. if there is multiple `background` type assets, the application _SHOULD_ use the main background as the background of the character card or let the user choose the background, or change dynamically by the application. how the main background choosed is below on the specification.
- If the `type` field is `user_icon`, the asset _SHOULD_ be used as a user's icon. if one of the assets is `user_icon` type, the application _SHOULD_ use the asset as the user's icon. if there is multiple `user_icon` type assets, the application _MAY_ let the user choose the icon. if `uri` field is `ccdefault:`, and the card is PNG/APNG embedded, `ccdefault:` _SHOULD NOT_ point the PNG/APNG file itself or modified version of the PNG/APNG file. if the application supports feature known as "persona", the application _SHOULD_ disable persona feature if one or more of the assets is `user_icon` type. the usage as a icon _MAY_ be toggleable by the user, or application's persona settings.
- If the `type` field is `emotion`, the asset _SHOULD_ be used as an emotion or expression of the character. how this asset would be handled is up to the application.

This _MUST NOT_ taken to mean that the application must support these features. The application _MAY_ ignore the assets if the application does not support the feature that the asset is used for, determined by the `type` field.

`name` field _MUST_ be a string. this field _MAY_ be used to identify the asset. this field _SHOULD NOT_ be used on prompt engining. if `type` is `emotion`, `name` _SHOULD_ be used to identify the emotion like `happy`, `sad`, `angry` etc, and use element that `type` is `neutral` for default if it exists, if the application supports emotions. if `type` is `user_icon`, `name` _SHOULD_ be used as a name of the user. if `type` is `icon`, and `name` is `main`, the application _MUST_ use the asset as the main icon of the character card if icon is supported on the application. if there is more then one elements with `type` field is `icon`, there _MUST_ be one element with `name` field is `main`, this _MUST NOT_ be less or more than one. if `type` is `background`, and `name` is `main`, the application _MUST_ use the asset as the main background of the character card if background is supported on the application. if there is more then one elements with `type` field is `background`, there _MUST_ not be more than one element with `name` field is `main` with `background` type. if there is no element with `name` field is `main` with `background` type, the application _SHOULD_ use the first element with `background` type as the main background.

for other types, it is up to the application how to use and write the name field. for example, `name` field _MAY_ be used as a name of the background like `forest`, `city`, `space` etc.

`ext` field _MUST_ be a string. this field _MUST_ be a file extension of the asset for checking the format of the asset. this field _MUST_ be in lowercase and this field _MUST_ be a valid file extension without `.` like `png`. if the application does not support the file extension, the application _MAY_ ignore the asset. `ext` may also be `unknown` for unknown file extensions.
Applications can decide what format to support. however, applications _SHOULD_ support at least png, jpeg and webp format. if `uri` field is `ccdefault:`, this field _SHOULD_ be ignored.

If the applicaiton determines that the asset is not valid or accessible or does not support the feature that the asset is used for, the application _MAY_ ignore the asset, but the application _SHOULD_ keep the asset data so it can be exported safely. if it is impossible or hard to save the asset data, the application _MAY_ not save the asset data and do not export the asset data when exporting the CharacterCard object, but it _MUST_ alert the user that the asset is not saved.

applications _MAY_ add more types of assets, but added types _SHOULD_ start with `x_` to prevent conflicts with the types defined in the specification.

### `group_only_greetings`

The value of this field _MUST_ be an array of string. this field _MUST_ be present. this field _MAY_ be empty array. this field _MUST_ be used to define the greetings that the character card would use.

This value _SHOULD_ be considered as the additional greetings that the character card would use, only for group chats.

### `creation_date`

The value of this field _MUST_ be a number or undefined. this field _MAY_ be used to determine the creation date of the character card. the value _MUST_ be a unix timestamp in seconds. application _SHOULD_ add this field when the character card is created. application _SHOULD NOT_ allow the user to edit this field. application _SHOULD NOT_ modify this field if the value is already present. the time _MUST_ be Unix timestamp in seconds, in UTC timezone. application _MAY_ put `0` instead to this field to determine that the creation date is unknown for privacy reasons and more.

### `modification_date`

The value of this field _MUST_ be a number or undefined. this field _MAY_ be used to determine the modification date of the character card. the value _MUST_ be a unix timestamp in seconds. application _SHOULD_ add or modify this field when the character card is exported, and _MAY_ modify this field when the character card is modified. application _SHOULD NOT_ allow the user to edit this field. the time _MUST_ be Unix timestamp in seconds, in UTC timezone. application _MAY_ put `0` instead to this field to determine that the modification date is unknown for privacy reasons and more.
