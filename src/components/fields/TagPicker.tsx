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
import { Tag, Avatar, Field } from "@fluentui/react-components";
import { fuzzyMatch } from "../../tools/matcher";
import { keysFix } from "../../tools/fixs";

export type FreeTagPickerProps = {
  value: string[];
  onChange: (value: string[]) => void;
  options?: string[];
  placeholder?: string;
};

export const FreeTagPicker: React.FC<FreeTagPickerProps> = ({
  value,
  onChange,
  options = [],
  placeholder = "请输入标签",
}) => {
  const [query, setQuery] = React.useState<string>("");

  const handleOptionSelect: TagPickerProps["onOptionSelect"] = (_, data) => {
    onChange(keysFix(data.selectedOptions.filter((x) => x !== "no-options")));
    setQuery("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValue = query;
    if (e.key === "Enter" && inputValue.trim()) {
      const newTag = inputValue.trim();
      const newTags = newTag
        .split(/[,，]/g)
        .map((x) => x.trim())
        .filter(Boolean)
        .filter((x) => !value.includes(x));
      onChange([...value, ...newTags]);
      setQuery("");
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
      noPopover={options.length === 0}
      selectedOptions={value}
      onOptionSelect={handleOptionSelect}
      // @ts-ignore
      mountNode={document.querySelector(".fui-FluentProvider main")}
      positioning={"below-start"}
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
          placeholder={placeholder}
          onChange={(ev) => setQuery(ev.target.value)}
          onKeyDown={handleInputKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
        />
      </TagPickerControl>

      <TagPickerList>
        {is_composition ? null : (
          <>
            <TagPickerOption
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
