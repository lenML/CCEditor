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
} from "@fluentui/react-components";
import { useI18n } from "../../tools/i18n";

const tavern = new TinyTavern();

const useStyles = makeStyles({
  col: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingHorizontalL,
  },
});

export const ToolTab = ({
  getCard,
}: {
  getCard: () => CharacterCard | undefined;
}) => {
  const card = useMemo(getCard, [getCard]);
  const [user, setUser] = useState("User");
  const [assistant, setAssistant] = useState(card?.name ?? "Assistant");
  const [result, setResult] = useState("");
  const styles = useStyles();
  const t = useI18n();

  if (!card) return null;

  const handleCompile = () => {
    try {
      const compiled = tavern.compile(card, {
        user,
        char: assistant,
      });
      setResult(compiled);
    } catch (error) {
      console.error(error);
      alert(`${error}`);
    }
  };

  return (
    <div className={styles.col}>
      <fieldset>
        <legend>{t("Test Template")}</legend>
        <div className={styles.col}>
          <Field label={t("User Name")}>
            <Input value={user} onChange={(e, data) => setUser(data.value)} />
          </Field>

          <Field label={t("Assistant Name")}>
            <Input
              value={assistant}
              onChange={(e, data) => setAssistant(data.value)}
            />
          </Field>

          <Button appearance="primary" onClick={handleCompile}>
            {t("Generate")}
          </Button>

          <Field label={t("Output Result")}>
            <Textarea value={result} readOnly resize="vertical" rows={10} />
          </Field>
        </div>
      </fieldset>
    </div>
  );
};
