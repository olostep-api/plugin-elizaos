# @olostep/plugin-web-search

An [ElizaOS](https://elizaos.ai) plugin that adds web search powered by [Olostep](https://www.olostep.com) to your agents.

## What it does

Adds an `OLOSTEP_SEARCH` action that searches the web via Olostep's `/searches` endpoint and returns a deduplicated list of relevant links with titles and descriptions.

## Installation

```bash
bun install
bun run build
```

## Configuration

Add your Olostep API key to your agent's settings:

```json
{
  "name": "MyAgent",
  "settings": {
    "secrets": {
      "OLOSTEP_API_KEY": "your-olostep-api-key-here"
    }
  }
}
```

Get your API key at https://www.olostep.com/dashboard

## Usage

Add the plugin to your Eliza character config, then start the agent with the normal ElizaOS flow:

```ts
import type { Character } from '@elizaos/core';

export const character: Character = {
  name: 'MyAgent',
  plugins: [
    '@elizaos/plugin-bootstrap',
    '@elizaos/plugin-openai',
    '@olostep/plugin-web-search',
  ],
};
```

Then run your project:

```bash
elizaos start
```

Example prompts you can send your agent:

- `Search for the latest news about AI agents`
- `Look up elizaOS on the web`
- `Find the official docs for ElizaOS plugins`

Once configured, your agent can use Olostep search when users ask it to search the web, look something up, or find online information.

## API

Uses the Olostep `/searches` endpoint directly via fetch, without any SDK dependency.

Returns `result.links[]` where each link has `url`, `title`, and `description`.