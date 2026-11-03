import {registerHooks} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createR157FrozenSourceReader} from '../lib/r157-frozen-source-reader.mjs';

export const TAIHEMEN_PARENT_COMMIT = 'c376ef094e0377ecee183a31252d3eadb95c54a2';
const repository = fileURLToPath(new URL('../../', import.meta.url));
const entry = 'src/scene/palace/TaihemenObservedApproach.js';

/** Test-only, byte-verified historical module graph. Never hooks current src/.
 * Fresh clones can use the tracked snapshot without original Git history or a
 * sibling checkout. The existing reader authenticates commit, trees and blobs.
 */
export async function loadTaihemenParent(root = repository) {
  const reader = createR157FrozenSourceReader(root, TAIHEMEN_PARENT_COMMIT);
  // Verify the complete closed graph even when Node already cached its modules.
  const sources = new Map(reader.paths.map(path => [path, reader.read(path)]));
  const namespace = `taihemen-c376://${createHash('sha256').update(root).digest('hex')}/`;
  const hook = registerHooks({
    resolve(specifier, context, next) {
      if (specifier.startsWith(namespace)) return {url: specifier, shortCircuit: true};
      if (!context.parentURL?.startsWith(namespace)) return next(specifier, context);
      if (specifier.startsWith('.')) {
        const url = new URL(specifier, context.parentURL).href;
        if (!url.startsWith(namespace)) throw Error('Taihemen frozen import escaped its namespace');
        return {url, shortCircuit: true};
      }
      if (specifier === 'three') return next(specifier, {...context, parentURL: import.meta.url});
      throw Error(`Unexpected Taihemen frozen external dependency: ${specifier}`);
    },
    load(url, context, next) {
      if (!url.startsWith(namespace)) return next(url, context);
      const path = url.slice(namespace.length);
      if (!sources.has(path)) throw Error(`Taihemen frozen dependency is not pinned: ${path}`);
      return {format: 'module', source: sources.get(path), shortCircuit: true};
    },
  });
  try { return await import(namespace + entry); }
  finally { hook.deregister(); }
}

export const {taihemenSouthProfile, buildTaihemenSouthApproach} = await loadTaihemenParent();
