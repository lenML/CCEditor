import { Field, Input } from "@fluentui/react-components";
import { useStyles } from "../useStyles";
import { useI18n } from "../../tools/i18n";
import { useMemo } from "react";
import { FullscreenEditor } from "../edit/FullscreenEditor";

export const BasicTab = ({
  formData,
  handleInputChange,
}: {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
}) => {
  const styles = useStyles();

  const t = useI18n();

  // --- Form Fields Config (separated by tabs) ---
  const basicInfoFields = useMemo(
    () => [
      { name: "name", label: t("Name"), component: Input, fullWidth: true },
      { name: "nickname", label: t("Nickname"), component: Input },
      { name: "creator", label: t("Creator"), component: Input },
      {
        name: "character_version",
        label: t("Character Version"),
        component: Input,
      },
      { name: "tags", label: t("Tags (comma-separated)"), component: Input },
      {
        name: "source",
        label: t("Source (comma-separated)"),
        component: Input,
        fullWidth: true,
      },
      {
        name: "description",
        label: t("Description"),
        // component: Textarea,
        component: FullscreenEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 4,
      },
    ],
    [t]
  );

  return (
    <div className={styles.formGrid}>
      {basicInfoFields.map((fc) => (
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
