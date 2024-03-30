import { TranslateFunction } from "@refinedev/core/dist/interfaces/bindings/i18n";

export const getOrderTypeOptions = (t: TranslateFunction) => [
  {
    label: t("orders.fields.type.OFFLINE"),
    value: "OFFLINE",
  },
  {
    label: t("orders.fields.type.ONLINE"),
    value: "ONLINE",
  },
];

export const getReturnTypeOptions = (t: TranslateFunction) => [
  {
    label: t("return-forms.fields.type.OFFLINE"),
    value: "OFFLINE",
  },
  {
    label: t("return-forms.fields.type.ONLINE"),
    value: "ONLINE",
  },
];

export const getReturnPaymentTypeOptions = (t: TranslateFunction) => [
  {
    label: t("return-forms.fields.paymentType.Cash"),
    value: "Cash",
  },
  {
    label: t("return-forms.fields.paymentType.Transfer"),
    value: "Transfer",
  },
];
