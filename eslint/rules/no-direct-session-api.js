/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow direct use of auth.api.getSession in favor of the deduped getSession function.",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [], // no options
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'MemberExpression' &&
          node.object.object.type === 'Identifier' &&
          node.object.object.name === 'auth' &&
          node.object.property.type === 'Identifier' &&
          node.object.property.name === 'api' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'getSession'
        ) {
          context.report({
            node,
            message: 'Do not use auth.api.getSession directly. Instead, import and use the deduped getSession function from "@/lib/session".',
          });
        }
      },
    };
  },
};
