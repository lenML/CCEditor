import { useI18nStore } from "../tools/i18n";
import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Button,
} from "@fluentui/react-components";
import { Globe16Regular } from "@fluentui/react-icons";

export const LangSwitch = () => {
  const { currentLang, local_keys, setLang } = useI18nStore();

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          icon={<Globe16Regular />}
          appearance="transparent"
          title={currentLang}
          size="small"
        >
          {currentLang}
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {local_keys.map((lang) => (
            <MenuItem key={lang} onClick={() => setLang(lang)} role="menuitem">
              {lang}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
