/**
 * @fileoverview Hàm này tạo ra thông tin về cách sắp xếp dữ liệu dựa trên các tham số đầu vào.
 * @param {CrudSorting} sorters - Các bộ sắp xếp CRUD (CrudSorting) để chuyển đổi thành thông tin sắp xếp.
 * @returns {{ sortBy: string[]; orderBy: string[] } | undefined} - Một đối tượng chứa thông tin về cách sắp xếp dữ liệu.
 */

import { CrudSorting } from "@refinedev/core";

export const generateSort = (
  sorters?: CrudSorting
): { sortBy: string[]; orderBy: string[] } | undefined => {
  if (sorters && sorters.length > 0) {
    const sortBy: string[] = [];
    const orderBy: string[] = [];

    sorters.map((item) => {
      sortBy.push(item.field);
      orderBy.push(item.order);
    });

    return {
      sortBy,
      orderBy,
    };
  }

  return;
};
