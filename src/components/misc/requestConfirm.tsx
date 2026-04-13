import { createRoot } from "react-dom/client";
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FluentProvider,
  webDarkTheme,
} from "@fluentui/react-components";
import { translate } from "../../tools/i18n";

interface ConfirmOptions {
  title?: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
}

export function requestConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      container.remove();
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    // NOTE: 这里脱离主应用，在vite dev环境可能会有点bug，但是问题不大
    root.render(
      <FluentProvider theme={webDarkTheme}>
        <Dialog open>
          <DialogSurface>
            <DialogBody>
              {options.title && <DialogTitle>{options.title}</DialogTitle>}
              <DialogContent>{options.content}</DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={handleCancel}>
                  {options.cancelText || translate("Cancel")}
                </Button>
                <Button appearance="primary" onClick={handleConfirm}>
                  {options.confirmText || translate("Confirm")}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </FluentProvider>
    );
  });
}
