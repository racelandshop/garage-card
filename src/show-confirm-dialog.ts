import { fireEvent } from "custom-card-helpers";


export interface ConfirmDialogParams {
  garageInfo;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const importConfirmDialog = () => import("./confirm-dialog");

export const showConfirmDialog = (
  element: HTMLElement,
  ConfirmDialogParams: ConfirmDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "confirm-dialog",
    dialogImport: importConfirmDialog,
    dialogParams: ConfirmDialogParams,
  });
};