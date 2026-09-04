import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  SplitButton,
} from "@fluentui/react-components";
import { useI18n } from "../../tools/i18n";
import { CardDumper } from "../../tools/CardDumper";

export type SaveProcess = (
  cb: (dumper: CardDumper) => Promise<void>
) => Promise<void>;

export function AvatarDownloadMenu({
  version,
  disabled,
  onSave,
}: {
  version: "v1" | "v2" | "v3" | "max";
  disabled?: boolean;
  onSave: SaveProcess;
}) {
  const t = useI18n();

  const download = async (method: "png" | "jpeg" | "webp" | "charx") => {
    await onSave((dumper) => {
      if (method === "png") return dumper.download_png(version);
      if (method === "jpeg") return dumper.download_jpeg(version);
      if (method === "webp") return dumper.download_webp(version);
      return dumper.download_charx(version);
    });
  };

  const options = [
    { label: t("Download JPEG"), method: "jpeg" as const },
    { label: "🚧" + t("Download WebP"), method: "webp" as const },
    { label: "🚧" + t("Download Charx"), method: "charx" as const },
  ];

  return (
    <Menu positioning="below-end">
      <MenuTrigger disableButtonEnhancement>
        {(triggerProps) => (
          <SplitButton
            menuButton={triggerProps}
            primaryActionButton={{
              onClick: () => download("png"),
              style: { flex: 1 },
            }}
            disabled={disabled}
          >
            {t("Download PNG")}
          </SplitButton>
        )}
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {options.map(({ label, method }) => (
            <MenuItem key={method} disabled={disabled} onClick={() => download(method)}>
              {label}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
