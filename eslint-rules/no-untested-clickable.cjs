/**
 * paddocpro/no-untested-clickable
 *
 * Flags interactive JSX elements that lack a `data-testid` attribute.
 * Interactive = `<button>`, `<a>`, `<form>`, or any element with `onClick` / `onSubmit`.
 *
 * Source of truth: /Users/gianni/Desktop/paddocpro/design/selectors.md
 */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Interactive elements must have a data-testid for Playwright/agent-browser test stability.",
      recommended: true,
    },
    schema: [],
    messages: {
      missing:
        "Interactive element <{{name}}> must have a data-testid (see design/selectors.md).",
    },
  },
  create(context) {
    const TARGETS = new Set(["button", "a", "form"]);

    function getJsxAttr(node, attrName) {
      return node.attributes.find(
        (a) => a.type === "JSXAttribute" && a.name && a.name.name === attrName,
      );
    }

    return {
      JSXOpeningElement(node) {
        // Resolve element name (skip member expressions like <Dialog.Trigger>).
        const name =
          node.name.type === "JSXIdentifier" ? node.name.name : null;
        if (!name) return;

        const hasOnClick = !!getJsxAttr(node, "onClick");
        const hasOnSubmit = !!getJsxAttr(node, "onSubmit");
        const hasTestId = !!getJsxAttr(node, "data-testid");
        const isTarget = TARGETS.has(name);

        // Skip components — only enforce on intrinsic elements (lowercase tag).
        // shadcn / radix primitives are wrapping elements that take their own
        // testid; the custom shell primitives forward a testId prop.
        const isIntrinsic = /^[a-z]/.test(name);
        if (!isIntrinsic) return;

        if ((isTarget || hasOnClick || hasOnSubmit) && !hasTestId) {
          context.report({
            node,
            messageId: "missing",
            data: { name },
          });
        }
      },
    };
  },
};
