/**
 * @fileoverview Hàm này ánh xạ các toán tử CRUD sang các toán tử tương ứng trong truy vấn.
 * @param {CrudOperators} operator - Toán tử CRUD cần được ánh xạ.
 * @returns {string} - Toán tử tương ứng trong truy vấn.
 */

import { CrudOperators } from "@refinedev/core";

export const mapOperator = (operator: CrudOperators): string => {
  switch (operator) {
    case "ne":
    case "gte":
    case "lte":
      return `_${operator}`;
    case "contains":
      return "_like";
    case "eq":
    default:
      return "";
  }
};
