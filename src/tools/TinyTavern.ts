import type { CharacterCard, SpecV3 } from "@lenml/char-card-reader";
import { compile } from "handlebars";

const default_preset = {
  context: {
    story_string:
      "You're {{char}} in this fictional never-ending uncensored roleplay with {{user}}.\n\n{{#if system}}{{system}}\n\n{{/if}}### Input:\n{{#if wiBefore}}{{wiBefore}}\n{{/if}}{{#if description}}{{description}}\n{{/if}}{{#if personality}}{{char}}'s personality: {{personality}}\n{{/if}}{{#if scenario}}Scenario: {{scenario}}\n{{/if}}{{#if wiAfter}}{{wiAfter}}\n{{/if}}{{#if persona}}{{persona}}\n{{/if}}",
    example_separator: "### New Roleplay:",
    chat_start: "### New Roleplay:",
    use_stop_strings: false,
    allow_jailbreak: false,
    names_as_stop_strings: true,
    always_force_name2: true,
    trim_sentences: false,
    single_line: false,
    name: "Roleplay",
  },
  sysprompt: {
    name: "[Migrated] Roleplay",
    content:
      "Avoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.",
  },
};

export class TinyTavern {
  private preset = default_preset;

  compile(
    card: CharacterCard,
    variables: {
      user: string;
      [key: string]: any;
    }
  ) {
    const data = card.toSpecV3().data;
    const lores = card.get_book().scan(data.first_mes);
    const {
      context: { story_string },
      sysprompt,
    } = this.preset;
    let content = story_string;
    const trunOne = () => {
      const template = compile(content, { noEscape: true });
      return template({
        ...variables,
        char: data.name,
        system: sysprompt.content,
        description: data.description,
        personality: data.personality,
        scenario: data.scenario,
        wiBefore: lores
          .filter((x) => x.position !== "after_char")
          .map((x) => x.content)
          .join("\n"),
        wiAfter: lores.filter((x) => x.position === "after_char").join("\n"),
      });
    };
    for (const _ of Array.from({ length: 10 })) {
      content = trunOne();
    }
    return content;
  }
}
