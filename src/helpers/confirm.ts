/**
 * @fileoverview
 * Các hàm hiển thị comfirm dialog với các tùy chọn tùy chỉnh, sử dụng PrimeReact ConfirmDialog.
 */

import { confirmDialog } from "primereact/confirmdialog";
import { IConfirmDialogOptions, TranslateFunction } from "../interfaces";

type ConfirmDialogProps = {
  options: IConfirmDialogOptions;
  t: TranslateFunction;
};

const getDefaultOptions = (
  options: IConfirmDialogOptions,
  t: TranslateFunction,
  type: string
): IConfirmDialogOptions => ({
  message: options.message || t(`confirmDialog.${type}.message`),
  header: options.header || t(`confirmDialog.${type}.header`),
  icon:
    options.icon ||
    (type === "edit" ? "pi pi-exclamation-triangle" : "pi pi-info-circle"),
  acceptLabel: options.acceptLabel || t(`confirmDialog.${type}.acceptLabel`),
  rejectLabel: options.rejectLabel || t(`confirmDialog.${type}.rejectLabel`),
  acceptClassName:
    options.acceptClassName ||
    (type === "edit" ? "p-button-warning" : "p-button-danger"),
  accept: () => {
    if (options.accept) {
      options.accept();
    }
  },
  reject: () => {
    if (options.reject) {
      options.reject();
    }
  },
});

const showConfirmDialog = (
  type: string,
  { options, t }: ConfirmDialogProps
) => {
  const { message, header, icon, acceptLabel, rejectLabel, acceptClassName } =
    getDefaultOptions(options, t, type);

  confirmDialog({
    message,
    header,
    icon,
    acceptLabel,
    rejectLabel,
    acceptClassName,
    accept: options.accept,
    reject: options.reject,
  });
};

export const showWarningConfirmDialog = (props: ConfirmDialogProps) => {
  showConfirmDialog("edit", props);
};

export const showDangerConfirmDialog = (props: ConfirmDialogProps) => {
  showConfirmDialog("delete", props);
};
