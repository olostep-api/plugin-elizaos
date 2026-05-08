import type { Plugin } from '@elizaos/core';
import { olostepSearchAction } from './actions/olostepSearch';

export const olostepPlugin: Plugin = {
  name: 'plugin-olostep',
  description:
    'Web search plugin powered by Olostep. Searches the web and returns deduplicated results with titles, descriptions, and URLs.',
  actions: [olostepSearchAction],
  providers: [],
  evaluators: [],
  services: [],
};

export default olostepPlugin;