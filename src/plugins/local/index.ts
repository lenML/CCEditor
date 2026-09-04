import { pluginRegistry } from "../registry";
import { WelcomeBuilderTool } from "./welcomeBuilder";
import type { Plugin } from "../types";

const welcomeBuilderPlugin: Plugin = {
  id: "cc-editor.welcome-builder",
  name: "Welcome Builder",
  version: "1.0.0",
  source: "local",
  description:
    "Build the card's welcome message, to test whether variables in the text resolve correctly",
  tools: [
    {
      id: "welcome-builder",
      name: "WelcomeBuilder",
      description:
        "Build the card's welcome message, to test whether variables in the text resolve correctly",
      component: WelcomeBuilderTool,
    },
  ],
};

pluginRegistry.register(welcomeBuilderPlugin);
