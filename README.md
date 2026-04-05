# awesome-fb

CLI tool for posting to Facebook Pages, built with Node.js.

## Installation

```bash
npm install -g awesome-fb
```

Or run directly from source:

```bash
git clone <repo>
cd fbtool
npm install
npm link
```

> On Windows with Git Bash, if `awesome-fb` is not recognized after `npm link`, add an alias to `~/.bashrc`:
> ```bash
> alias awesome-fb="node '/path/to/fbtool/bin/awesome-fb.js'"
> ```

---

## API Key Configuration

Create a `.env` file in your working directory:

```env
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key
```

Get your keys at: [Unsplash Developers](https://unsplash.com/developers) · [Pexels API](https://www.pexels.com/api/)

---

## Command Overview

```
awesome-fb add-page                                  Add a new Facebook Page
awesome-fb list-pages                                View saved pages

awesome-fb search-image -q <keyword>                Search images, select manually
awesome-fb search-image -q <keyword> -a <n>         Auto-download the first N images

awesome-fb post                                      Post (interactive)
awesome-fb post -p <page> -m <content> -y           Quick one-line post

awesome-fb draft                                     Draft management menu
awesome-fb draft save                                Save a new draft
awesome-fb draft list                                List all drafts
awesome-fb draft preview                             Preview a draft in the browser
awesome-fb draft delete                              Delete a draft
```

---

## Managing Pages

### Add a page

```bash
awesome-fb add-page
```

1. Enter the **Page ID** — the numeric part of the Facebook page URL
2. Enter the **Access Token** — get it from [Graph API Explorer](https://developers.facebook.com/tools/explorer/), select your page and copy the token
3. The CLI verifies with Facebook and displays the real page name
4. Set a **friendly name** to distinguish between multiple pages

If the page already exists, the CLI asks if you want to update the token.

### View saved pages

```bash
awesome-fb list-pages
```

---

## Image Search

```bash
awesome-fb search-image --query "coffee morning"
```

| Flag | Description | Default |
|---|---|---|
| `-q, --query` | Search keyword **(required)** | — |
| `-s, --source` | Image source: `unsplash`, `pexels` | `unsplash` |
| `-n, --count` | Number of images to search | `5` |
| `-a, --auto` | Auto-download the first N images without prompting | — |

Downloaded images are saved to `~/.awesome-fb/images/`.

### Manual mode (default)

Displays a list of found images; the user selects one to download:

```bash
awesome-fb search-image --query "nature sunset" --source pexels --count 10
```

### Auto mode (`--auto`)

Skips the selection step and automatically downloads the first N images:

```bash
# Auto-download the first 3 images
awesome-fb search-image --query "coffee" --auto 3

# Search 20 images, auto-download the first 5
awesome-fb search-image --query "nature" --count 20 --auto 5
```

The CLI displays download progress per image and prints each file path when done.

---

## Posting

### Interactive

```bash
awesome-fb post
```

Flow:
1. If drafts exist → ask if you want to load from a draft
2. Select the page to post to
3. Enter post content (opens editor)
4. Choose whether to attach an image: search via Unsplash/Pexels or enter a local path
5. Preview the post in the browser (simulated Facebook interface)
6. Confirm and post

### Quick one-line post

```bash
# Text only
awesome-fb post -p "Main Page" -m "Post content" --no-preview -y

# With a local image
awesome-fb post -p "Shop A" -m "Flash sale today!" -i "/path/to/image.jpg" --no-preview -y

# Skip page selection, still open editor to enter content
awesome-fb post -p "Main Page"
```

| Flag | Description |
|---|---|
| `-p, --page <name>` | Page friendly name — skips the page selection prompt |
| `-m, --message <text>` | Post content — skips the editor |
| `-i, --image <path>` | Local image path |
| `--no-preview` | Skip the browser preview step |
| `-y, --yes` | Auto-confirm, no re-prompting |

---

## Drafts

Save unposted content to reuse later, with the option to preview before posting.

```bash
awesome-fb draft           # Main menu
awesome-fb draft save      # Save a new draft (interactive)
awesome-fb draft list      # View drafts (title, content preview, last updated)
awesome-fb draft preview   # Preview a draft in the browser
awesome-fb draft delete    # Delete a draft (with confirmation)
```

### Quick one-line draft

```bash
# Provide both --title and --message → saves immediately without prompting
awesome-fb draft save -t "April Flash Sale" -m "50% off all products today!"

# With an image
awesome-fb draft save -t "Weekend Post" -m "Happy weekend!" -i "/path/image.jpg"

# Partial — only title, still opens editor for content
awesome-fb draft save -t "New idea"
```

| Flag | Description |
|---|---|
| `-t, --title <title>` | Draft title |
| `-m, --message <text>` | Post content — skips the editor |
| `-i, --image <path>` | Local image path |

When running `awesome-fb post`, if drafts exist the CLI will ask:

```
? You have 2 drafts. Load content from a draft? (y/N)
```

Select a draft to auto-fill content and image path, no need to re-enter.

---

## Data Storage

All data is stored locally on the user's machine — no server involved:

```
~/.awesome-fb/
├── config.json   # List of pages and access tokens
├── drafts.json   # Draft posts
└── images/       # Downloaded images
```

> **Security note:** Access tokens are stored in plain text. Keep the `~/.awesome-fb/` directory private.

---

## Common Errors

| Error | Solution |
|---|---|
| `No pages found` | Run `awesome-fb add-page` first |
| `Token expired` | Get a new token and run `awesome-fb add-page` again |
| `Missing UNSPLASH_ACCESS_KEY` | Add the key to your `.env` file |
| `Page ID does not exist` | Double-check the Page ID on Facebook |
| `Cannot open preview` | Verify the image path exists |
| `command not found: awesome-fb` | Run `npm link` or add an alias to `~/.bashrc` |
