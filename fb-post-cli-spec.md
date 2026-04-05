# Technical Specification: awesome-fb

> **CLI tool for posting to Facebook Pages — built with Node.js, distributed via npm**

---

## 1. Project Overview

| Property | Details |
|---|---|
| **Package name** | `awesome-fb` |
| **Language** | Node.js (ES Modules or CommonJS) |
| **Distribution** | npm public registry |
| **Storage** | Local (on the user's machine) |
| **Goal** | Simple CLI for managing and posting to Facebook Pages |

---

## 2. Overall Architecture

```
awesome-fb/
├── bin/
│   └── fb-post.js           # CLI entry point (shebang script)
├── src/
│   ├── commands/
│   │   ├── post.js          # Command: create post
│   │   ├── search-image.js  # Command: search images
│   │   ├── add-page.js      # Command: add page
│   │   └── list-pages.js    # Command: list pages
│   ├── adapters/
│   │   ├── image-adapter.js     # Standard interface for image sources
│   │   ├── unsplash-adapter.js  # Adapter for Unsplash
│   │   └── pexels-adapter.js    # (Extension example) Adapter for Pexels
│   ├── services/
│   │   ├── facebook.js      # Communication with Facebook Graph API
│   │   └── storage.js       # Read/write local data
│   └── utils/
│       ├── config.js        # Manage local config paths
│       └── logger.js        # Log / display results in terminal
├── package.json
└── README.md
```

---

## 3. Local Storage

All data is stored on the user's machine — **no remote server or database**.

### 3.1 Storage paths

```
~/.awesome-fb/
├── config.json      # List of added pages
└── images/          # Images downloaded from search sources
```

### 3.2 `config.json` structure

```json
{
  "pages": [
    {
      "id": "123456789",
      "name": "Main Store Page",
      "accessToken": "EAAxxxxxx...",
      "addedAt": "2025-04-01T08:00:00Z"
    }
  ]
}
```

> **Security:** Access tokens are stored in plain text locally. Users are responsible for protecting the `~/.awesome-fb/` directory. A future version may integrate with the OS keychain/secret store.

---

## 4. Feature Details

### 4.1 Create Post (`post`)

**Command:**
```bash
fb-post post
```

**Execution flow:**

1. Check for pages in `config.json`. If none exist → display error and guide user to `add-page`.
2. Display page selection menu (using `inquirer` or equivalent).
3. Enter **post content** (content/caption).
4. Ask the user if they want to attach an image:
   - **Yes** → choose: (a) search for an image via the search command, or (b) enter a local file path.
   - **No** → skip the image step.
5. Confirm details before posting.
6. Call the **Facebook Graph API** to publish the post.
7. Display result: Post ID, post link.

**Facebook API used:**

| Case | Endpoint |
|---|---|
| Text only | `POST /{page-id}/feed` |
| Text + image | `POST /{page-id}/photos` |

**Sample payload (text + image):**
```json
{
  "message": "Post content",
  "source": "<binary image data>",
  "access_token": "<page_access_token>"
}
```

---

### 4.2 Image Search (`search-image`)

**Command:**
```bash
fb-post search-image --query "coffee morning" --source unsplash
```

**Parameters:**

| Flag | Required | Description | Default |
|---|---|---|---|
| `--query` / `-q` | ✅ | Search keyword | — |
| `--source` / `-s` | ❌ | Image source (`unsplash`, `pexels`, ...) | `unsplash` |
| `--count` / `-n` | ❌ | Number of images to display | `5` |

**Execution flow:**

1. Receive `--query` and `--source` from the user.
2. Call the correct **Adapter** for the given `--source`.
3. Display the list of images (thumbnail URL + author name).
4. User selects the image they want to download.
5. Download the image to `~/.awesome-fb/images/`.
6. Display the saved file path.

#### Adapter Pattern

All adapters must implement the following interface:

```javascript
// src/adapters/image-adapter.js (Interface / Base class)
class ImageAdapter {
  /**
   * @param {string} query - Search keyword
   * @param {number} count - Number of results
   * @returns {Promise<ImageResult[]>}
   */
  async search(query, count) {
    throw new Error('search() must be implemented by the subclass adapter');
  }

  /**
   * @param {string} url - Image URL to download
   * @param {string} destPath - File save path
   * @returns {Promise<string>} - Saved file path
   */
  async download(url, destPath) {
    throw new Error('download() must be implemented by the subclass adapter');
  }
}

/**
 * @typedef {Object} ImageResult
 * @property {string} id
 * @property {string} description
 * @property {string} thumbUrl
 * @property {string} downloadUrl
 * @property {string} author
 * @property {string} sourceName
 */
```

**Unsplash Adapter (`unsplash-adapter.js`):**

- API: `https://api.unsplash.com/search/photos`
- Auth: `Authorization: Client-ID <UNSPLASH_ACCESS_KEY>`
- Users need to configure `UNSPLASH_ACCESS_KEY` (see Section 6).

**Adding a new image source:**  
Simply create `<name>-adapter.js` in `src/adapters/`, implement `search()` and `download()`, then register it in `adapter-registry.js`.

---

### 4.3 Add Page (`add-page`)

**Command:**
```bash
fb-post add-page
```

**Execution flow:**

1. Prompt for **Page ID** (from Facebook).
2. Prompt for the page's **Access Token**.
3. Call the Facebook Graph API to **verify** the page exists and the token is valid:
   ```
   GET /{page-id}?fields=id,name&access_token={token}
   ```
4. If valid: display the actual page name from Facebook.
5. Prompt the user to **set a friendly name** for the page in the CLI (e.g., "Main Page", "Shop A").
6. Save the information to `~/.awesome-fb/config.json`.
7. Display a success message.

**Error handling:**

- Expired / invalid token → clear error message, nothing is saved.
- Page ID does not exist → error message.
- Page already exists in config → ask if you want to update the token.

---

### 4.4 List Pages (`list-pages`)

**Command:**
```bash
fb-post list-pages
```

**Sample output:**
```
┌─────────────────────────────────────────────────────┐
│  Saved Facebook Pages                                │
├───┬──────────────────┬─────────────────┬────────────┤
│ # │ Friendly Name    │ Page ID         │ Date Added │
├───┼──────────────────┼─────────────────┼────────────┤
│ 1 │ Main Page        │ 123456789       │ 01/04/2025 │
│ 2 │ Shop A           │ 987654321       │ 15/03/2025 │
└───┴──────────────────┴─────────────────┴────────────┘
Total: 2 page(s)
```

---

## 5. Data Flow Diagram

```
User (Terminal)
        │
        ▼
   bin/fb-post.js  ──── parse args (commander/yargs)
        │
        ▼
  commands/*.js   ──── orchestration logic
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
services/storage.js       services/facebook.js
(local read/write)         (Graph API calls)
~/.awesome-fb/
        │
        ▼
   adapters/*.js
(search & download images from external APIs)
```

---

## 6. API Key Configuration

Users configure API keys via **environment variables** or a `.env` file in the current directory:

```bash
# Unsplash
UNSPLASH_ACCESS_KEY=your_unsplash_key

# (Extension) Pexels
PEXELS_API_KEY=your_pexels_key
```

The CLI reads from `process.env` and displays a warning if a key is missing when using the related feature.

---

## 7. Expected Dependencies

| Package | Purpose |
|---|---|
| `commander` or `yargs` | Parse CLI arguments |
| `inquirer` | Interactive prompts (select page, image, etc.) |
| `axios` or `node-fetch` | HTTP API calls (Facebook, Unsplash, etc.) |
| `cli-table3` | Display formatted tables in terminal |
| `chalk` | Colorize terminal output |
| `ora` | Loading spinner during API calls |
| `fs-extra` | Advanced file/directory operations |
| `dotenv` | Read environment variables from `.env` |

---

## 8. Publishing to npm

### 8.1 `package.json` configuration

```json
{
  "name": "awesome-fb",
  "version": "1.0.0",
  "description": "CLI tool for posting to Facebook Pages",
  "bin": {
    "fb-post": "./bin/fb-post.js"
  },
  "keywords": ["facebook", "cli", "post", "social-media"],
  "engines": {
    "node": ">=16.0.0"
  },
  "files": [
    "bin/",
    "src/",
    "README.md"
  ]
}
```

### 8.2 Publish process

```bash
# 1. Log in to npm
npm login

# 2. Verify package before publishing
npm pack --dry-run

# 3. Publish
npm publish --access public
```

### 8.3 How users install and use it

```bash
# Install globally
npm install -g awesome-fb

# Use immediately
fb-post list-pages
fb-post add-page
fb-post search-image --query "nature sunset"
fb-post post
```

---

## 9. Error Handling & UX

| Situation | Behavior |
|---|---|
| No pages saved | Clear message + guidance to run `add-page` |
| Token expired | Display error + guide to get a new token |
| Missing image API key | Warning, skip image search feature |
| No internet | Catch network error, display friendly message |
| `config.json` corrupted | Auto-recreate the file, warn the user |

---

## 10. Future Roadmap

- Add image adapters: **Pexels**, **Pixabay**, **Getty Images**
- Support posting **multiple images** in one post (carousel)
- Support **scheduling** posts (scheduled post)
- Save post **drafts** not yet ready to publish
- Support posting to **Instagram** (using the same Graph API)
- Encrypt locally stored access tokens (OS keychain)

---

*Specification version 1.0 — April 2025*
