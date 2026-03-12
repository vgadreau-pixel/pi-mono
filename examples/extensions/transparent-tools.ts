/**
 * Transparent Tools Example Extension
 * 
 * Demonstrates how to use Theme.setBackgroundOverride() to make
 * tool execution blocks transparent, allowing terminal background
 * images to show through.
 * 
 * Usage:
 *   pi -e ./transparent-tools.ts
 * 
 * Or copy to ~/.pi/agent/extensions/ for permanent use.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { theme } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  // Enable transparent mode for tool blocks
  // This makes tool backgrounds transparent so terminal background images show through
  theme.setBackgroundOverride((color, text, defaultBg) => {
    // Only override tool block backgrounds
    const toolBgColors = ["toolPendingBg", "toolSuccessBg", "toolErrorBg"];
    
    if (toolBgColors.includes(color)) {
      // Return text without background - this makes it transparent!
      return text;
    }
    
    // Return undefined to use default background for other colors
    return undefined;
  });

  // Optional: Add a command to toggle transparency
  let transparent = true;
  
  pi.registerCommand("tools-transparent", {
    description: "Toggle transparent tool blocks",
    handler: async (_args, ctx) => {
      transparent = !transparent;
      
      if (transparent) {
        theme.setBackgroundOverride((color, text, defaultBg) => {
          if (["toolPendingBg", "toolSuccessBg", "toolErrorBg"].includes(color)) {
            return text;
          }
          return undefined;
        });
        ctx.ui.notify("✓ Transparent tool blocks enabled", "success");
      } else {
        theme.setBackgroundOverride(() => undefined);
        ctx.ui.notify("Default tool blocks enabled", "info");
      }
    },
  });

  // Show status on startup
  pi.on("session_start", async (_event, ctx) => {
    if (ctx.hasUI) {
      ctx.ui.setStatus("transparent-tools", ctx.ui.theme.fg("success", "◐"));
    }
  });
}
