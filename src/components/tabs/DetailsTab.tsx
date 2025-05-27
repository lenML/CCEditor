import { Field } from "@fluentui/react-components";
import { useI18n } from "../../tools/i18n";
import { useStyles } from "../useStyles";
import { FullscreenEditor } from "../edit/FullscreenEditor";
import { useMemo } from "react";
import { TextArrayEditor } from "./TextArrayEditor/TextArrayEditor";

export const DetailsTab = ({
  formData,
  handleInputChange,
}: {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
}) => {
  const styles = useStyles();
  const t = useI18n();

  const detailsFields = useMemo(
    () => [
      {
        name: "personality",
        label: t("Personality"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 4,
      },
      {
        name: "scenario",
        label: t("Scenario"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 4,
      },
      {
        name: "first_mes",
        label: t("First Message"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
      },
      {
        name: "mes_example",
        label: t("Message Example"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
      },
      {
        name: "alternate_greetings",
        label: t("Alternate Greetings"),
        component: TextArrayEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
      },
      {
        name: "group_only_greetings",
        label: t("Group Only Greetings"),
        component: TextArrayEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
      },
      {
        name: "system_prompt",
        label: t("System Prompt"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
      },
      {
        name: "post_history_instructions",
        label: t("Post History Instructions"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
      },
      {
        name: "creator_notes",
        label: t("Creator Notes"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
      },
    ],
    [t]
  );

  return (
    <div className={styles.formGrid}>
      {detailsFields.map((fc) => (
        <Field
          key={fc.name}
          label={fc.label}
          className={fc.fullWidth ? styles.fullWidth : ""}
        >
          <fc.component
            value={formData[fc.name]}
            onChange={(_, d) => handleInputChange(fc.name, d.value)}
            rows={fc.rows}
            resize={fc.resize as any}
            window_title={fc.label}
          />
        </Field>
      ))}
    </div>
  );
};
