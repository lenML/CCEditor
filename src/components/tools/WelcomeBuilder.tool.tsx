import { useState, type FC } from "react";
import { CCTool } from "./CCTool";
import {
  Button,
  Field,
  Input,
  makeStyles,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import { useI18n } from "../../tools/i18n";
import type { CharacterCard } from "@lenml/char-card-reader";
import { TinyTavern } from "../../tools/TinyTavern";

const tavern = new TinyTavern();
const useStyles = makeStyles({
  col: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingHorizontalL,
  },
});

function WelcomeBuilder({ card }: { card: CharacterCard }) {
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
    <>
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
    </>
  );
}

/**
 * 构建卡片欢迎消息
 *
 * 用于测试，比如测试某些文本中的变量是否正确
 */
export class WelcomeBuilderTool extends CCTool {
  constructor() {
    super("WelcomeBuilder", "构建卡片欢迎消息，以测试某些文本中的变量是否正确");
  }
  component = WelcomeBuilder;
}
