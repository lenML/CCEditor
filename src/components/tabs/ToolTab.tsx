import type { CharacterCard } from "@lenml/char-card-reader";
import { useMemo, useState } from "react";
import { TinyTavern } from "../../tools/TinyTavern";
import {
  Input,
  Button,
  Textarea,
  Label,
  Field,
  makeStyles,
  tokens,
  Divider,
} from "@fluentui/react-components";
import { useI18n } from "../../tools/i18n";
import { tools } from "../tools/tools";
import { useBoolean } from "@huse/boolean";
import type { CCTool } from "../tools/CCTool";

import {
  ArrowMaximizeVerticalRegular,
  ArrowMinimizeVerticalRegular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  col: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingHorizontalL,
  },
  fieldset: {
    flexDirection: "column",
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalS,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
});

function ToolCard({ card, tool }: { card: CharacterCard; tool: CCTool }) {
  const { name, desc, component: Comp } = tool;
  const styles = useStyles();
  const t = useI18n();
  const [is_expand, expand] = useBoolean();
  return (
    <fieldset className={styles.fieldset}>
      <legend>
        <Button
          onClick={expand.toggle}
          appearance="subtle"
          icon={
            is_expand ? (
              <ArrowMinimizeVerticalRegular />
            ) : (
              <ArrowMaximizeVerticalRegular />
            )
          }
        >
          {/* {is_expand ? t("collapse") : t("expand")} */}
        </Button>
        {t(name)}
      </legend>
      <span>{desc}</span>{" "}
      {is_expand ? (
        <>
          {" "}
          <Divider style={{ margin: tokens.spacingVerticalS }} />{" "}
          <Comp card={card} />{" "}
        </>
      ) : null}
    </fieldset>
  );
}

export const ToolTab = ({
  getCard,
}: {
  getCard: () => CharacterCard | undefined;
}) => {
  const card = useMemo(getCard, [getCard]);
  const styles = useStyles();
  const t = useI18n();

  if (!card) return null;

  return (
    <div className={styles.col}>
      {tools.map((x) => (
        <ToolCard key={x.name} card={card} tool={x} />
      ))}
    </div>
  );
};
