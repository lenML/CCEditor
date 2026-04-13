import { makeStyles, tokens } from "@fluentui/react-components";
import { CCTool } from "./CCTool";
import { useI18n } from "../../tools/i18n";
import type { CharacterCard } from "@lenml/char-card-reader";

const useStyles = makeStyles({
  // styles
});

function TempToolComponent({ card }: { card: CharacterCard }) {
  const t = useI18n();
  const styles = useStyles();

  return null;
}

export class TempTool extends CCTool {
  constructor() {
    super("TempTool", "Demo tool implementing a temporary feature");
  }
  component = TempToolComponent;
}
