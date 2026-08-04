/**
 * Helper to safely extract nested property values from objects
 * e.g., getNestedValue(obj, 'data.user.email')
 */
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

/**
 * Evaluates mustache expressions: {{ $json.ticketId }} or {{ $node["NodeName"].json.summary }}
 */
export function evaluateExpression(
  expressionStr: string,
  context: {
    json?: Record<string, any>;
    nodeResults?: Record<string, any>;
    env?: Record<string, string>;
  }
): string {
  if (typeof expressionStr !== 'string') return String(expressionStr);

  const env = context.env || { API_KEY: 'lm_sk_live_9921', API_TOKEN: 'token_abc123' };
  const json = context.json || {};
  const nodeResults = context.nodeResults || {};

  return expressionStr.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, expr) => {
    try {
      const trimmed = expr.trim();

      // Case 1: $env.KEY
      if (trimmed.startsWith('$env.')) {
        const key = trimmed.replace('$env.', '');
        return env[key] ?? match;
      }

      // Case 2: $json.path
      if (trimmed.startsWith('$json')) {
        if (trimmed === '$json') return JSON.stringify(json);
        const path = trimmed.replace('$json.', '');
        const val = getNestedValue(json, path);
        if (val !== undefined) {
          return typeof val === 'object' ? JSON.stringify(val) : String(val);
        }
      }

      // Case 3: $node["Node Name"].json.path or $node['Node Name'].json.path
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

      // Fallback simple JS evaluator
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
