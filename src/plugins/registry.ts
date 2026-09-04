import type { Plugin, PluginToolContribution, PluginWelcomeContribution } from "./types";

export interface RegisteredPluginTool {
  plugin: Plugin;
  tool: PluginToolContribution;
  component: NonNullable<PluginToolContribution["component"]>;
}

export interface RegisteredPluginWelcome extends PluginWelcomeContribution {
  plugin: Plugin;
}

class PluginRegistry {
  private readonly plugins = new Map<string, Plugin>();

  register(plugin: Plugin): void {
    const existing = this.plugins.get(plugin.id);
    if (existing) {
      if (existing.version === plugin.version) return;
      throw new Error(`Plugin id already registered with a different version: ${plugin.id}`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  list(): Plugin[] {
    return [...this.plugins.values()];
  }

  getTools(): RegisteredPluginTool[] {
    return this.list().flatMap((plugin) =>
      (plugin.tools ?? [])
        .filter((tool) => tool.component != null)
        .map((tool) => ({
          plugin,
          tool,
          component: tool.component!,
        }))
    );
  }

  getWelcome(): RegisteredPluginWelcome[] {
    return this.list().flatMap((plugin) =>
      (plugin.welcome ?? []).map((welcome) => ({ ...welcome, plugin }))
    );
  }
}

export const pluginRegistry = new PluginRegistry();
