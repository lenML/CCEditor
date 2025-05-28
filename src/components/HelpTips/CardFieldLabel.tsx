import { Text } from "@fluentui/react-components";
import { HelpTips } from "./HelpTips";
import { useI18n } from "../../tools/i18n";

export const CardFieldLabel = ({
  name,
  label,
  tips,
}: {
  name: string;
  label: string;
  tips?: string;
}) => {
  return (
    <span>
      <Text>{label}</Text>
      {tips && <HelpTips spec_key={name} tips={tips} />}
    </span>
  );
};
