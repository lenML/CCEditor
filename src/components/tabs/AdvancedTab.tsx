import {
  Field,
  mergeClasses,
  Text,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import { useI18n } from "../../tools/i18n";
import { useStyles } from "../useStyles";
import { useMemo, useState } from "react";
import { FullscreenEditor } from "../edit/FullscreenEditor";
import { formatDateData } from "../../tools/times";

const DateText = ({ date }: { date: any }) => (
  <Text>{date ? formatDateData(date).toLocaleString() : "N/A"}</Text>
);

// 将 json 作为字符串解析处理
const JsonTextarea = ({
  value,
  onChange,
  className,
  rows,
  resize,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (...args: any[]) => void;
  className: string;
  rows: number;
  resize: string;
}) => {
  const [text] = useState(JSON.stringify(value, null, 2));

  return (
    <Textarea
      defaultValue={text}
      onChange={(ev, data) => {
        try {
          data.value = JSON.parse(data.value);
          onChange(ev, data);
        } catch (e) {
          console.error(e);
        }
      }}
      className={className}
      rows={rows}
      resize={resize as any}
    />
  );
};

const JsonFullEditor = ({
  name,
  label,
  value,
  onChange,
  ...props
}: {
  name: string;
  label: string;
  value: any;
  onChange: (...args: any[]) => void;
  [key: string]: any;
}) => {
  const [text] = useState(JSON.stringify(value, null, 2));

  return (
    <FullscreenEditor
      {...props}
      defaultValue={text}
      onChange={(ev, data) => {
        try {
          data.value = JSON.parse(data.value);
          onChange(ev, data);
        } catch (e) {
          console.error(e);
        }
      }}
      name={name}
      label={label}
      editor_language="json"
    />
  );
};

export const AdvancedTab = ({
  formData,
  handleInputChange,
}: {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
}) => {
  const styles = useStyles();
  const t = useI18n();

  const advancedFields = useMemo(
    () => [
      {
        name: "assets",
        label: t("Assets (JSON Array)"),
        component: JsonFullEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 4,
      },
      {
        name: "extensions",
        label: t("Extensions (JSON Object)"),
        component: JsonFullEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 4,
      },
      {
        name: "creator_notes_multilingual",
        label: t("Creator Notes Multilingual (JSON Object)"),
        component: JsonFullEditor,
        fullWidth: true,
        resize: "vertical",
        rows: 4,
      },
    ],
    [styles.readOnlyTextarea, t]
  );

  return (
    <div className={styles.formGrid}>
      {advancedFields.map((fc) => (
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
            name={fc.name}
            label={fc.label}
          />
        </Field>
      ))}
      <div
        className={mergeClasses(styles.fullWidth, styles.formGrid)}
        style={{
          gridTemplateColumns: "1fr 1fr",
          marginTop: tokens.spacingVerticalS,
        }}
      >
        <Field label={t("Creation Date")}>
          <DateText date={formData.creation_date} />
        </Field>
        <Field label={t("Modification Date")}>
          <DateText date={formData.modification_date} />
        </Field>
      </div>
    </div>
  );
};
