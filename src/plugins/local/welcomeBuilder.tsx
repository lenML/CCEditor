import { useState } from "react";
import {
  Button,
  Field,
  Input,
  makeStyles,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import type { CharacterCard } from "@lenml/char-card-reader";
import { TinyTavern } from "../../tools/TinyTavern";
import { useI18n } from "../../tools/i18n";
const tavern = new TinyTavern();

const useStyles = makeStyles({
  col: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingHorizontalL,
  },
});

export function WelcomeBuilderTool({ card }: { card: CharacterCard }) {
  const t = useI18n();
  const styles = useStyles();
  const [user, setUser] = useState("User");
  const [assistant, setAssistant] = useState(card.name ?? "Assistant");
  const [result, setResult] = useState("");

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
      <Field label={t("User Name")}>
        <Input value={user} onChange={(_, data) => setUser(data.value)} />
      </Field>
      <Field label={t("Assistant Name")}>
        <Input value={assistant} onChange={(_, data) => setAssistant(data.value)} />
      </Field>
      <Button appearance="primary" onClick={handleCompile}>
        {t("Generate")}
      </Button>
      <Field label={t("Output Result")}>
        <Textarea value={result} readOnly resize="vertical" rows={10} />
      </Field>
    </div>
  );
}


