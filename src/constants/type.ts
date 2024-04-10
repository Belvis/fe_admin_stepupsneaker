import { TranslateFunction } from "../interfaces";

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
