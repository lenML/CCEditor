import { Field } from "@fluentui/react-components";
import { useI18n } from "../../tools/i18n";
import { useStyles } from "../useStyles";
import { FullscreenEditor } from "../edit/FullscreenEditor";
import { useMemo } from "react";
import { TextArrayEditor } from "./TextArrayEditor/TextArrayEditor";
import { CardFieldLabel } from "../HelpTips/CardFieldLabel";

export const DetailsTab = ({
  formData,
  handleInputChange,
}: {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
}) => {
  const styles = useStyles();
  const t = useI18n();

  const editor_props = {
    placeholder: t("no text here."),
  };
  const array_props = {
    inputPlaceholder: t("Enter text..."),
    addButtonLabel: t("Add Item"),
  };

  const detailsFields = useMemo(
    () => [
      {
        name: "personality",
        label: t("Personality"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 4,
        props: editor_props,
      },
      {
        name: "scenario",
        label: t("Scenario"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 4,
        props: editor_props,
      },
      {
        name: "first_mes",
        label: t("First Message"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
        props: editor_props,
      },
      {
        name: "mes_example",
        label: t("Message Example"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
        props: editor_props,
      },
      {
        name: "alternate_greetings",
        label: t("Alternate Greetings"),
        component: TextArrayEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
        props: {
          ...array_props,
          deleteConfirmText: t(
            "Are you sure you want to delete this greeting?"
          ),
        },
      },
      {
        name: "group_only_greetings",
        label: t("Group Only Greetings"),
        component: TextArrayEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
        props: {
          ...array_props,
          deleteConfirmText: t(
            "Are you sure you want to delete this greeting(group only)?"
          ),
        },
      },
      {
        name: "system_prompt",
        label: t("System Prompt"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
        props: editor_props,
      },
      {
        name: "post_history_instructions",
        label: t("Post History Instructions"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
        props: editor_props,
      },
      {
        name: "creator_notes",
        label: t("Creator Notes"),
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 3,
        props: editor_props,
      },
    ],
    [t]
  );

  return (
    <div className={styles.formGrid}>
      {detailsFields.map((fc) => (
        <Field
          key={fc.name}
          label={
            <CardFieldLabel
              name={fc.name}
              label={fc.label}
              tips={t(`help-${fc.name}`)}
            />
          }
          className={fc.fullWidth ? styles.fullWidth : ""}
        >
          <fc.component
            value={formData[fc.name]}
            onChange={(_, d) => handleInputChange(fc.name, d.value)}
            rows={fc.rows}
            resize={fc.resize as any}
            window_title={fc.label}
            {...fc.props}
          />
        </Field>
      ))}
    </div>
  );
};
