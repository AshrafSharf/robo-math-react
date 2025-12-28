# Point2Space Iframe SDK

SDK for lesson builder and viewer iframe apps to communicate with the Point2Space platform.

## Installation

Copy the `iframe-sdk` folder to your iframe app, or publish as an npm package.

## Usage

```javascript
import { parentBridge, iframeStorage } from './iframe-sdk';

// Initialize on app startup
async function init() {
  // Wait for parent to send auth token and context
  await parentBridge.init();

  // Access lesson context
  const { lessonId, channelId, mode, contentUrl } = parentBridge.getContext();
  console.log(`Editing lesson ${lessonId} in ${mode} mode`);

  // Load lesson content
  const content = await iframeStorage.loadContent();
  console.log('Loaded lesson:', content);
}

init();
```

## Loading Lesson Content

The parent app provides a signed URL for the lesson content in the INIT message:

```javascript
import { parentBridge, iframeStorage } from './iframe-sdk';

await parentBridge.init();

// Option 1: Use the pre-signed URL (fastest, recommended)
const content = await parentBridge.loadLessonContent();

// Option 2: Smart load - uses signed URL if valid, falls back to API
const content = await iframeStorage.loadContent();

// Option 3: Always fetch from API (bypasses signed URL)
const content = await iframeStorage.fetchLessonContent();

// Option 4: Load a specific version
const content = await iframeStorage.fetchLessonContent(2);
```

## Uploading Images

```javascript
import { iframeStorage } from './iframe-sdk';

async function handleImageUpload(file) {
  try {
    const result = await iframeStorage.uploadImage(file);
    console.log('Uploaded:', result.path);
    console.log('URL:', result.signedUrl);
    console.log('Expires:', new Date(result.expiresAt * 1000));
    return result;
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}
```

## Getting Signed URLs

```javascript
import { iframeStorage } from './iframe-sdk';

// Single URL (cached automatically)
const url = await iframeStorage.getSignedUrl('channel-id/123-image.png');

// Multiple URLs (efficient batching)
const urls = await iframeStorage.getSignedUrls([
  'channel-id/123-image1.png',
  'channel-id/456-image2.png',
]);

// Force refresh (bypass cache)
const freshUrl = await iframeStorage.getSignedUrl('path', true);
```

## Saving Content

```javascript
import { parentBridge } from './iframe-sdk';

// Save lesson content (handled by parent app)
parentBridge.saveContent(
  { slides: [...], metadata: {...} },  // Content object
  'Updated slide 3'                      // Version notes
);
```

## Modules

### parentBridge

Handles postMessage communication with the parent app.

| Method | Description |
|--------|-------------|
| `init()` | Initialize and wait for parent. Returns Promise. |
| `getToken()` | Get JWT auth token |
| `getContext()` | Get `{ lessonId, channelId, mode, apiBaseUrl, contentUrl, contentExpiresAt }` |
| `isEditMode()` | Check if in edit mode |
| `isViewMode()` | Check if in view mode |
| `getContentUrl()` | Get the lesson content signed URL |
| `isContentUrlValid(bufferMs?)` | Check if content URL is still valid |
| `loadLessonContent()` | Load lesson content from signed URL |
| `saveContent(content, notes)` | Request parent to save content |
| `reportError(code, message)` | Report error to parent |

### iframeStorage

API client for storage operations with automatic caching.

| Method | Description |
|--------|-------------|
| `uploadImage(file)` | Upload image, returns `{ path, signedUrl, expiresAt }` |
| `getSignedUrl(path, forceRefresh?)` | Get signed URL for path |
| `getSignedUrls(paths, forceRefresh?)` | Batch get signed URLs |
| `refreshExpiringUrls(paths)` | Refresh URLs about to expire |
| `getCachedUrl(path)` | Get cached URL synchronously (or null) |
| `clearCache()` | Clear URL cache |
| `loadContent()` | Smart load lesson content (uses signed URL or API) |
| `loadLessonContent()` | Load from parent's signed URL |
| `fetchLessonContent(version?)` | Fetch lesson content via API |
| `getLessonContentUrl(version?)` | Get fresh signed URL for lesson |

### signedUrlCache

Low-level cache for signed URLs.

| Method | Description |
|--------|-------------|
| `set(path, signedUrl, expiresAt)` | Cache a URL |
| `get(path)` | Get cached URL (null if expired) |
| `has(path)` | Check if path has valid cached URL |
| `getPathsNeedingRefresh(paths)` | Get paths that need refresh |
| `cleanup()` | Remove expired entries |

## Message Protocol

### Parent → Iframe

| Type | Payload | Description |
|------|---------|-------------|
| `INIT` | `{ token, lessonId, channelId, mode, apiBaseUrl }` | Initialization data |
| `TOKEN_REFRESH` | `{ token }` | Refreshed auth token |

### Iframe → Parent

| Type | Payload | Description |
|------|---------|-------------|
| `READY` | `{}` | Iframe is ready for INIT |
| `SAVE_CONTENT` | `{ content, notes }` | Request to save content |
| `ERROR` | `{ code, message }` | Error notification |

## Environment

The iframe app needs to be hosted on a subdomain that's configured in the parent app's CORS and iframe origins settings:

- Development: `http://localhost:5174` (builder), `http://localhost:5175` (viewer)
- Production: Set via `IFRAME_BUILDER_ORIGIN` and `IFRAME_VIEWER_ORIGIN` env vars
