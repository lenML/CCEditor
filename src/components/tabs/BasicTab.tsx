import { Field, Input } from "@fluentui/react-components";
import { useStyles } from "../useStyles";
import { useI18n } from "../../tools/i18n";
import { useMemo } from "react";
import { FullscreenEditor } from "../edit/FullscreenEditor";
import { FreeTagPicker } from "../fields/TagPicker";
import tags from "../../assets/tags.json";
import { HelpTips } from "../HelpTips/HelpTips";
import { CardFieldLabel } from "../HelpTips/CardFieldLabel";

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
      {
        name: "tags",
        label: t("Tags (comma-separated)"),
        component: (props: any) => (
          <FreeTagPicker
            value={props.value ?? []}
            onChange={(tags) => props.onChange({}, { value: tags })}
            options={tags}
            placeholder={t("Input or select tags")}
          />
        ),
      },
      // CCV3 里的字段，似乎不需要用户编辑，去掉了
      // {
      //   name: "source",
      //   label: t("Source (comma-separated)"),
      //   component: (props: any) => (
      //     <FreeTagPicker
      //       value={props.value ?? []}
      //       onChange={(tags) => props.onChange({}, { value: tags })}
      //       options={[]}
      //       placeholder={""}
      //     />
      //   ),
      //   fullWidth: true,
      // },
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
          />
        </Field>
      ))}
    </div>
  );
};
