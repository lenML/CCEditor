import * as React from "react";
import { Tooltip } from "@fluentui/react-components";
import { Info24Regular } from "@fluentui/react-icons";
import { marked } from "marked";
import { useStyles } from "../useStyles";

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (...args) => {
  const html = linkRenderer.call(renderer, ...args);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

const spec_mapping = {
  CCV1: {
    keys: [
      "name",
      "description",
      "personality",
      "scenario",
      "first_mes",
      "mes_example",
    ],
    url: "https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v1.md",
  },
  CCV2: {
    keys: [
      "name",
      "description",
      "personality",
      "scenario",
      "first_mes",
      "mes_example",
      "spec",
      "spec_version",
      "creator_notes",
      "system_prompt",
      "post_history_instructions",
      "alternate_greetings",
      "character_book",
      "tags",
      "creator",
      "character_version",
      "extensions",
    ],
    url: "https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md",
  },
  CCV3: {
    keys: [
      "name",
      "description",
      "personality",
      "scenario",
      "first_mes",
      "mes_example",
      "spec",
      "spec_version",
      "creator_notes",
      "system_prompt",
      "post_history_instructions",
      "alternate_greetings",
      "character_book",
      "tags",
      "creator",
      "character_version",
      "extensions",
      "assets",
      "nickname",
      "creator_notes_multilingual",
      "source",
      "group_only_greetings",
      "creation_date",
      "modification_date",
    ],
    url: "https://github.com/kwaroran/character-card-spec-v3/blob/main/SPEC_V3.md",
  },
};

// 将多行 tips 转为 html
// 根据 spec_key 增加对 spec 的引用链接
function renderTips(content: string, className: string, spec_key: string) {
  const match_specs = Object.entries(spec_mapping)
    .filter((x) => x[1].keys.includes(spec_key.toLowerCase()))
    .map(([key, { url }]) => `[${key}](${url}#${spec_key})`)
    .join(" | ");

  if (match_specs) {
    content += `\n\n${match_specs}`;
  }
  const htmlContent = marked(content, { renderer });
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    ></div>
  );
}

export const HelpTips = ({
  tips,
  spec_key,
}: {
  tips: string;
  spec_key: string;
}) => {
  const [iconRef, setIconRef] = React.useState<HTMLSpanElement | null>(null);
  const styles = useStyles();
  return (
    <Tooltip
      positioning={{ target: iconRef, position: "after" }}
      withArrow
      content={renderTips(tips, styles.tips_markdown_body, spec_key)}
      relationship="description"
      appearance="inverted"
    >
      <span className="ml-1" ref={setIconRef}>
        <Info24Regular className="size-3" />
      </span>
    </Tooltip>
  );
};
