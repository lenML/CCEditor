import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from "@fluentui/react-components";
import { useI18n } from "../../tools/i18n";

export function ShareLinkDialog({
  open,
  url,
  onClose,
}: {
  open: boolean;
  url: string;
  onClose: () => void;
}) {
  const t = useI18n();
  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{t("Share Link")}</DialogTitle>
          <DialogContent>
            <p className="mb-3">
              {t(
                "You can share the link to edit this card, your friend can click it to reach this tool's edit page"
              )}
            </p>
            <Textarea className="w-full" readOnly rows={10} value={url} />
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary" onClick={onClose}>
                {t("Ok")}
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
