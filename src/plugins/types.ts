import type { ComponentType } from "react";
import type { CharacterCard } from "@lenml/char-card-reader";

export type PluginSource = "local" | "remote";
export type PluginContributionKind = "tool" | "welcome";

export interface PluginToolContext {
  card: CharacterCard;
}

export interface PluginToolContribution {
  id: string;
  name: string;
  description?: string;
  /** Local tools register their React component directly. */
  component?: ComponentType<PluginToolContext>;
  /** Reserved for future remote manifests; remote loading is not implemented yet. */
  entrypoint?: string;
}

export interface PluginWelcomeContribution {
  id: string;
  name: string;
  description?: string;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  source: PluginSource;
  description?: string;
  author?: string;
  homepage?: string;
  /** Reserved for future remote plugin catalog integration. */
  manifestUrl?: string;
  tools?: PluginToolContribution[];
  welcome?: PluginWelcomeContribution[];
}
