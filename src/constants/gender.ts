import { TranslateFunction } from "@refinedev/core/dist/interfaces/bindings/i18n";

export const getCustomerGenderOptions = (t: TranslateFunction) => [
  {
    label: t("customers.fields.gender.options.Male"),
    value: "Male",
  },
  {
    label: t("customers.fields.gender.options.Female"),
    value: "Female",
  },
  {
    label: t("customers.fields.gender.options.Other"),
    value: "Other",
  },
];
