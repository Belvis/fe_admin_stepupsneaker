import { CrudSorting } from "@refinedev/core";
import { TableProps } from "antd";
import { IPaymentResponse } from "../../interfaces";

export const calculateIndex = (
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

export const calculateChange = (
  payments: IPaymentResponse[],
  totalPrice: number,
  discount: number
) => {
  const totalPaid = payments
    .filter((payment) => payment.paymentStatus !== "PENDING")
    .reduce((acc, payment) => acc + payment.totalMoney, 0);

  const changeAmount = totalPaid - (totalPrice - discount);

  return changeAmount;
};
export const calculatePayment = (
  payments: IPaymentResponse[],
  status?: "COMPLETED" | "PENDING"
) => {
  const totalPaid = payments
    .filter((payment) => payment.paymentStatus !== status)
    .reduce((acc, payment) => acc + payment.totalMoney, 0);

  return totalPaid;
};
