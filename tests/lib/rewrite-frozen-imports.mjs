import {parseAst} from 'rollup/parseAst';

// A frozen source is evaluated in a data URL while its dependencies keep their
// original module locations. Only AST ImportDeclaration source literals move.
// Ordinary strings, comments and executable statements remain byte exact.
export function rewriteFrozenImports(source,{origin,resolveBare}){
 if(typeof source!=='string'||!(origin instanceof URL)||typeof resolveBare!=='function')throw TypeError('Explicit frozen source, original module URL and bare resolver required');
 const imports=parseAst(source).body.filter(node=>node.type==='ImportDeclaration');
 let output=source;
 for(const node of imports.toReversed()){
  const literal=node.source,specifier=literal.value;
  if(typeof specifier!=='string')throw TypeError('Static import source string required');
  const target=specifier.startsWith('.')?new URL(specifier,origin).href:resolveBare(specifier);
  if(typeof target!=='string'||!target.length)throw TypeError('Resolved import source string required');
  output=output.slice(0,literal.start)+JSON.stringify(target)+output.slice(literal.end);
 }
 return output;
}
