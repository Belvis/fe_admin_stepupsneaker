import { CrudSorting } from "@refinedev/core";
import { TableProps } from "antd";

// utils/calculateIndex.ts
const calculateIndex = (
  sorters: CrudSorting,
  current: number,
  pageSize: number,
  tableProps: TableProps,
  index: number
): number => {
  let isDescOrder = false;

  if (Array.isArray(sorters) && sorters.length > 0) {
    const sorter = sorters[sorters.length - 1];

    if (sorter && sorter.order === "desc") {
      isDescOrder = true;
    }
  }

  const pagination = tableProps.pagination as any;
  const totalItems = pagination.total;

  const calculatedIndex = isDescOrder
    ? totalItems - (current - 1) * pageSize - index
    : (current - 1) * pageSize + index + 1;

  return calculatedIndex;
};

export default calculateIndex;
