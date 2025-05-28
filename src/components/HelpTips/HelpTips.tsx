import * as React from "react";
import { Tooltip } from "@fluentui/react-components";
import { Info24Regular } from "@fluentui/react-icons";
import { useI18n } from "../../tools/i18n";
import { marked } from "marked";
import { useStyles } from "../useStyles";

// 将多行 tips 转为 html
function renderTips(content: string, className: string) {
  const lines = content.split("\n");
  const htmlContent = marked(lines.join("\n"));
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    ></div>
  );
}

export const HelpTips = ({ tips }: { tips: string }) => {
  const [iconRef, setIconRef] = React.useState<HTMLSpanElement | null>(null);
  const styles = useStyles();
  return (
    <Tooltip
      positioning={{ target: iconRef, position: "after" }}
      withArrow
      content={renderTips(tips, styles.tips_markdown_body)}
      relationship="description"
      appearance="inverted"
    >
      <span className="ml-1" ref={setIconRef}>
        <Info24Regular className="size-3" />
      </span>
    </Tooltip>
  );
};
