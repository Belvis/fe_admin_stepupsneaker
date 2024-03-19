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
