import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
} from '@elizaos/core';

type OlostepLink = {
  url: string;
  title: string;
  description: string;
};

type OlostepSearchResponse = {
  result?: {
    links?: OlostepLink[];
  };
};

function dedupeLinks(links: OlostepLink[]): OlostepLink[] {
  const seen = new Set<string>();
  const deduped: OlostepLink[] = [];

  for (const link of links) {
    const key = link.url.trim().toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(link);
  }

  return deduped;
}

function formatSearchResults(query: string, links: OlostepLink[]): string {
  const topLinks = dedupeLinks(links).slice(0, 5);

  if (topLinks.length === 0) {
    return `No results found for: "${query}"`;
  }

  const formatted = topLinks
    .map((link, index) => {
      const title = link.title?.trim() || link.url;
      const description = link.description?.trim() || 'No description available.';

      return `${index + 1}. ${title}\n   ${description}\n   ${link.url}`;
    })
    .join('\n\n');

  return `Here are the top results for "${query}":\n\n${formatted}`;
}

export const olostepSearchAction: Action = {
  name: 'OLOSTEP_SEARCH',
  similes: [
    'WEB_SEARCH',
    'SEARCH_WEB',
    'INTERNET_SEARCH',
    'SEARCH_INTERNET',
    'SEARCH_ONLINE',
    'OLOSTEP_WEB_SEARCH',
  ],
  description:
    'Search the web using Olostep and return a list of relevant links with titles and descriptions. Use this when the user asks to search for information, look something up online, or find web results.',
  validate: async (runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    const apiKey = runtime.getSetting('OLOSTEP_API_KEY');
    return typeof apiKey === 'string' && apiKey.trim().length > 0;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: unknown,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    const apiKey = runtime.getSetting('OLOSTEP_API_KEY');

    if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      const errorText =
        'OLOSTEP_API_KEY is not configured. Set it in your agent settings under OLOSTEP_API_KEY.';
      if (callback) {
        await callback({ text: errorText });
      }
      return {
        success: false,
        text: errorText,
        error: errorText,
      };
    }

    const query = message.content?.text?.trim();
    if (!query) {
      if (callback) {
        await callback({ text: 'No search query provided.' });
      }
      return {
        success: false,
        text: 'No search query provided.',
        error: 'No search query provided.',
      };
    }

    try {
      const response = await fetch('https://api.olostep.com/v1/searches', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorText = `Olostep search failed: ${response.status} ${response.statusText}`;
        if (callback) {
          await callback({ text: errorText });
        }
        return {
          success: false,
          text: errorText,
          error: errorText,
        };
      }

      const data = (await response.json()) as OlostepSearchResponse;
      const links = data.result?.links ?? [];
      const responseText = formatSearchResults(query, links);

      if (callback) {
        await callback({ text: responseText });
      }

      return {
        success: true,
        text: responseText,
        data: {
          query,
          links,
        },
      };
    } catch (error: unknown) {
      const messageText = error instanceof Error ? error.message : String(error);
      if (callback) {
        await callback({ text: `Search error: ${messageText}` });
      }
      return {
        success: false,
        text: `Search error: ${messageText}`,
        error: messageText,
      };
    }
  },
  examples: [
    [
      { name: 'user', content: { text: 'Search for the latest news about AI agents' } },
      {
        name: 'assistant',
        content: {
          text: 'Here are the top results for "latest news about AI agents":...',
          action: 'OLOSTEP_SEARCH',
        },
      },
    ],
    [
      { name: 'user', content: { text: 'Look up elizaOS on the web' } },
      {
        name: 'assistant',
        content: {
          text: 'Here are the top results for "elizaOS":...',
          action: 'OLOSTEP_SEARCH',
        },
      },
    ],
  ],
};