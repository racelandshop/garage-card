import { fireEvent } from "custom-card-helpers";

export interface ConfirmDialogParams {
  garageInfo; //CameraInfo is a list of camera info (add this later with the corresponding camera info interface)
}

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