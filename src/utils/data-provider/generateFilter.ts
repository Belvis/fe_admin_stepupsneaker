/**
 * @fileoverview Tạo ra bộ lọc truy vấn dựa trên đối tượng CrudFilters được cung cấp.
 * @param filters - Các bộ lọc CRUD (CrudFilters) để chuyển đổi thành bộ lọc truy vấn.
 * @returns {Record<string, string>} Một đối tượng chứa các bộ lọc truy vấn được tạo ra.
 */

import { CrudFilters } from "@refinedev/core";
import { mapOperator } from "./mapOperator";

export const generateFilter = (
  filters?: CrudFilters
): Record<string, string> => {
  const queryFilters: Record<string, string> = {};

  if (filters) {
    filters.map((filter) => {
      if ("field" in filter) {
        const { field, operator, value } = filter;

        if (field === "q") {
          queryFilters[field] = value;
          return;
        }

        const mappedOperator = mapOperator(operator);
        queryFilters[`${field}${mappedOperator}`] = value;
      }
    });
  }

  return queryFilters;
};
