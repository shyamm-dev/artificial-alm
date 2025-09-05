/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow the use of authClient.getAccessToken in client components to prevent exposing access tokens.",
      category: "Security",
      recommended: true,
    },
    schema: [], // no options
  },
  create(context) {
    let isClientComponent = false;

    return {
      Program(node) {
        if (node.body.length > 0 &&
            node.body[0].type === 'ExpressionStatement' &&
            node.body[0].expression.type === 'Literal' &&
            node.body[0].expression.value === 'use client') {
          isClientComponent = true;
        }
      },
      MemberExpression(node) {
        if (
          isClientComponent &&
          node.object.type === 'Identifier' &&
          node.object.name === 'authClient' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'getAccessToken'
        ) {
          context.report({
            node,
            message: 'Do not use authClient.getAccessToken in client components. Access tokens should remain on the server.',
          });
        }
      },
    };
  },
};
