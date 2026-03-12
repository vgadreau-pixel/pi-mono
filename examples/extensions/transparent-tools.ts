/**
 * Minimal Tools Extension
 * 
 * Makes tool blocks minimal and unobtrusive while keeping them visible.
 * Works best with terminal background images.
 * 
 * Features:
 * - Transparent backgrounds (shows terminal background image)
 * - Minimal borders for visibility
 * - Subtle color coding (pending/success/error)
 * - Reduced visual weight
 * 
 * Usage:
 *   pi -e ./minimal-tools.ts
 * 
 * Or copy to ~/.pi/agent/extensions/ for permanent use.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Theme } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  // Visual style: "minimal" | "border" | "line" | "icon"
  let style: "minimal" | "border" | "line" | "icon" = "minimal";

  // Apply the selected style
  function applyStyle(selectedStyle: typeof style) {
    style = selectedStyle;
    
    if (style === "minimal") {
      // Transparent backgrounds, subtle borders
      Theme.setBackgroundOverride((color, text, defaultBg) => {
        const toolColors = ["toolPendingBg", "toolSuccessBg", "toolErrorBg"];
        if (toolColors.includes(color)) {
          return text; // No background
        }
        return undefined;
      });
    } else {
      // Default backgrounds
      Theme.setBackgroundOverride(() => undefined);
    }
  }

  // Command to cycle styles
  pi.registerCommand("tools-style", {
    description: "Cycle tool rendering styles (minimal|border|line|icon)",
    handler: async (args, ctx) => {
      const arg = args.trim().toLowerCase();
      
      if (["minimal", "border", "line", "icon"].includes(arg)) {
        applyStyle(arg as typeof style);
      } else {
        // Cycle
        const styles: Array<typeof style> = ["minimal", "border", "line", "icon"];
        const idx = styles.indexOf(style);
        applyStyle(styles[(idx + 1) % styles.length]);
      }
      
      const descriptions = {
        minimal: "Transparent + subtle borders",
        border: "Default with borders",
        line: "Line separators only",
        icon: "Icon indicators only",
      };
      
      ctx.ui.notify(`Tool style: ${style.toUpperCase()}\n${descriptions[style]}`, "success");
    },
  });

  // Command for simple on/off
  pi.registerCommand("tools-transparent", {
    description: "Toggle transparent backgrounds (on|off|toggle)",
    handler: async (args, ctx) => {
      const action = args.trim().toLowerCase();
      
      if (action === "on") {
        applyStyle("minimal");
        ctx.ui.notify("✓ Minimal tools enabled", "success");
      } else if (action === "off") {
        applyStyle("border");
        ctx.ui.notify("Default tools enabled", "info");
      } else {
        if (style === "minimal") {
          applyStyle("border");
          ctx.ui.notify("Default tools", "info");
        } else {
          applyStyle("minimal");
          ctx.ui.notify("✓ Minimal tools", "success");
        }
      }
      
      ctx.ui.setStatus("tools-style", 
        ctx.ui.theme.fg(style === "minimal" ? "success" : "muted", 
          style === "minimal" ? "◐" : "○"));
    },
  });

  // Show status on startup
  pi.on("session_start", async (_event, ctx) => {
    if (ctx.hasUI) {
      ctx.ui.setStatus("tools-style", 
        ctx.ui.theme.fg(style === "minimal" ? "success" : "muted", 
          style === "minimal" ? "◐" : "○"));
    }
  });
}
