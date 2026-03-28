# Crawlee + PlaywrightCrawler + TypeScript project

This template is a production ready boilerplate for developing with `PlaywrightCrawler`. Use this to bootstrap your projects using the most up-to-date code.

If you're looking for examples or want to learn more visit:

- [Documentation](https://crawlee.dev/js/api/playwright-crawler/class/PlaywrightCrawler)
- [Examples](https://crawlee.dev/js/docs/examples/playwright-crawler)

## Setup

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Copy `.env.example` to create `.env`:

```bash
cp .env.example .env
```

Edit `.env` file and set the required values:

```
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=asia-northeast1
```

### Encryption (Optional)

You can encrypt environment variables using dotenvx:

```bash
# Set value with encryption
pnpm env:set GOOGLE_CLOUD_PROJECT "your-project-id"
```

See: https://dotenvx.com/docs/quickstart

## Run

```bash
# Development mode
pnpm start:dev

# Watch mode
pnpm start:watch

# Production mode (after build)
pnpm start:prod
```

## Other Commands

```bash
# Lint
pnpm lint
pnpm lint:fix

# Format
pnpm fmt
pnpm fmt:check
```

## Output

Search results are saved in JSON format at `storage/datasets/default/`.

検索結果は `storage/datasets/default/` にJSON形式で保存されます。
