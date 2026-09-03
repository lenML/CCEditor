import * as React from "react";
import {
  TagPicker,
  TagPickerList,
  TagPickerInput,
  TagPickerControl,
  TagPickerOption,
  TagPickerGroup,
  type TagPickerProps,
  useTagPickerFilter,
} from "@fluentui/react-tag-picker";
import { Tag, Avatar, Field, makeStyles } from "@fluentui/react-components";
import { fuzzyMatch } from "../../tools/matcher";
import { keysFix } from "../../tools/fixs";
import { useI18n } from "../../tools/i18n";

export type FreeTagPickerProps = {
  value: string[];
  onChange: (value: string[]) => void;
  options?: string[];
  placeholder?: string;
};

const useStyles = makeStyles({
  listbox: {
    // maxHeight will be applied only positioning autoSize set.
    maxHeight: "250px",
  },
  option: {
    height: "46px",
  },
});

export const FreeTagPicker: React.FC<FreeTagPickerProps> = ({
  value,
  onChange,
  options = [],
  placeholder,
}) => {
  const t = useI18n();
  const [query, setQuery] = React.useState<string>("");

  const styles = useStyles();

  const resolvedPlaceholder = placeholder ?? t("Input or select tags");

  const handleOptionSelect: TagPickerProps["onOptionSelect"] = (_, data) => {
    onChange(keysFix(data.selectedOptions.filter((x) => x !== "no-options")));
    setQuery("");
  };

  const commitQuery = () => {
    const inputValue = query.trim();
    if (!inputValue) return;
    const newTags = inputValue
      .split(/[,，]/g)
      .map((x) => x.trim())
      .filter(Boolean)
      .filter((x) => !value.includes(x));
    if (newTags.length > 0) onChange([...value, ...newTags]);
    setQuery("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Commit the pending tag on Enter or Tab, so typing a key and moving
    // focus away with Tab does not silently discard it.
    if ((e.key === "Enter" || e.key === "Tab") && query.trim()) {
      commitQuery();
    }
  };
  const children = useTagPickerFilter({
    query,
    options,
    // noOptionsElement: (
    //   <TagPickerOption value="no-options">
    //     We couldn't find any matches
    //   </TagPickerOption>
    // ),
    noOptionsElement: <span></span>,
    renderOption: (option) => (
      <TagPickerOption
        className={styles.option}
        key={option}
        media={
          <Avatar shape="square" aria-hidden name={option} color="colorful" />
        }
        value={option}
      >
        {option}
      </TagPickerOption>
    ),

    filter: (option) => !value.includes(option) && fuzzyMatch(query, option),
  });

  const [is_composition, set_is_composition] = React.useState(false);

  const onCompositionStart = () => {
    set_is_composition(true);
  };

  const onCompositionEnd = () => {
    set_is_composition(false);
  };

  return (
    <TagPicker
      // @ts-ignore
      noPopover={options.length === 0}
      selectedOptions={value}
      onOptionSelect={handleOptionSelect}
      // @ts-ignore
      mountNode={document.querySelector(".fui-FluentProvider main")}
      positioning={{
        position: "below",
        autoSize: "width",
      }}
    >
      <TagPickerControl>
        <TagPickerGroup>
          {value.map((tag) => (
            <Tag
              key={tag}
              value={tag}
              shape="rounded"
              media={<Avatar aria-hidden name={tag} color="colorful" />}
            >
              {tag}
            </Tag>
          ))}
        </TagPickerGroup>

        <TagPickerInput
          value={query}
          placeholder={resolvedPlaceholder}
          onChange={(ev) => setQuery(ev.target.value)}
          onKeyDown={handleInputKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
        />
      </TagPickerControl>

      <TagPickerList className={styles.listbox}>
        {is_composition ? null : (
          <>
            <TagPickerOption
              className={styles.option}
              style={{ display: "none" }}
              key={query}
              media={
                <Avatar
                  shape="square"
                  aria-hidden
                  name={query}
                  color="colorful"
                />
              }
              value={query}
            >
              {query}
            </TagPickerOption>
            {children}
          </>
        )}
      </TagPickerList>
    </TagPicker>
  );
};
