export function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split(/[\.\[\]]/).filter(Boolean);
  let curr = obj;
  for (const part of parts) {
    const cleanPart = part.replace(/^['"]|['"]$/g, '');
    if (curr == null) return undefined;
    curr = curr[cleanPart];
  }
  return curr;
}

export function evaluateExpression(
  expressionStr: string,
  context: {
    json?: Record<string, any>;
    nodeResults?: Record<string, any>;
    env?: Record<string, string>;
  }
): string {
  if (typeof expressionStr !== 'string') return String(expressionStr);

  const env = context.env || {};
  const json = context.json || {};
  const nodeResults = context.nodeResults || {};

  return expressionStr.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, expr) => {
    try {
      const trimmed = expr.trim();

      if (trimmed === '$now') return new Date().toISOString();
      if (trimmed === '$uuid()' || trimmed === '$uuid') {
        return 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }

      if (trimmed.startsWith('$env.')) {
        const key = trimmed.replace('$env.', '');
        return env[key] ?? process.env[key] ?? match;
      }

      if (trimmed.startsWith('$json')) {
        if (trimmed === '$json') return JSON.stringify(json);
        const path = trimmed.replace('$json.', '');
        const val = getNestedValue(json, path);
        if (val !== undefined) {
          return typeof val === 'object' ? JSON.stringify(val) : String(val);
        }
      }

      const nodeMatch = trimmed.match(/^\$node\[['"]([^'"]+)['"]\](?:\.json)?(?:\.(.+))?$/);
      if (nodeMatch) {
        const [, nodeName, path] = nodeMatch;
        const nodeOutput = nodeResults[nodeName];
        if (nodeOutput) {
          if (!path) return JSON.stringify(nodeOutput);
          const val = getNestedValue(nodeOutput, path);
          if (val !== undefined) {
            return typeof val === 'object' ? JSON.stringify(val) : String(val);
          }
        }
      }

      const fn = new Function('$json', '$node', '$env', `
        try {
          return ${trimmed};
        } catch(e) {
          return null;
        }
      `);
      const res = fn(json, nodeResults, env);
      if (res !== null && res !== undefined) {
        return typeof res === 'object' ? JSON.stringify(res) : String(res);
      }
    } catch {
      // return original match on syntax error
    }
    return match;
  });
}
