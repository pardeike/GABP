# Attention Examples

This directory contains optional additive attention examples within `gabp/1`.

The examples demonstrate a minimal bridge flow:

1. Query the current open attention item.
2. Receive an `attention/opened` lifecycle event.
3. Explicitly acknowledge the attention item.
4. Observe that no current attention item remains open.

These examples are intentionally summarized. They demonstrate control flow, not full diagnostics transport.
