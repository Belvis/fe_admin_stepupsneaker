import { DateField, List, NumberField, useTable } from "@refinedev/antd";
import { HttpError, useNavigation, useTranslate } from "@refinedev/core";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo } from "react";
import { IVoucherHistoryResponse } from "../../interfaces";
import calculateIndex from "../../utils/common/calculateIndex";
import { formatTimestamp } from "../../helpers/timestamp";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";

type CustomerVoucherListProps = {
  id: string | undefined;
};

export const CustomerVoucherList: React.FC<CustomerVoucherListProps> = ({
  id,
}) => {
  const t = useTranslate();
  const { edit } = useNavigation();

  const {
    tableProps,
    current,
    pageSize,
    sorters,
    tableQueryResult: { refetch },
  } = useTable<IVoucherHistoryResponse, HttpError>({
    resource: "voucher-histories",
    initialSorter: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
    permanentFilter: [
      {
        field: "customer",
        operator: "eq",
        value: id,
      },
    ],
    initialPageSize: 5,
    syncWithLocation: false,
  });

  const columns = useMemo<ColumnsType<IVoucherHistoryResponse>>(
    () => [
      {
        title: "#",
        key: "index",
        width: "1rem",
        align: "center",
        sorter: {},
        defaultSortOrder: "descend",
        render: (value, record, index) =>
          calculateIndex(sorters, current, pageSize, tableProps, index),
      },
      {
        title: t("voucherHistories.fields.voucherCode"),
        key: "voucherCode",
        dataIndex: ["voucher", "code"],
        sorter: {},
        align: "center",
      },
      {
        title: t("voucherHistories.fields.orderCode"),
        key: "orderCode",
        dataIndex: ["order", "code"],
        sorter: {},
        align: "center",
      },
      {
        title: t("voucherHistories.fields.moneyReduction"),
        key: "moneyReduction",
        dataIndex: "moneyReduction",
        sorter: {},
        align: "center",
        render(value) {
          return (
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={value}
              locale={"vi"}
            />
          );
        },
      },
      {
        title: t("voucherHistories.fields.moneyBeforeReduction"),
        key: "moneyBeforeReduction",
        dataIndex: "moneyBeforeReduction",
        sorter: {},
        align: "center",
        render(value) {
          return (
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={value}
              locale={"vi"}
            />
          );
        },
      },
      {
        title: t("voucherHistories.fields.moneyAfterReduction"),
        key: "moneyAfterReduction",
        dataIndex: "moneyAfterReduction",
        sorter: {},
        align: "center",
        render(value) {
          return (
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={value}
              locale={"vi"}
            />
          );
        },
      },
      {
        title: t("voucherHistories.fields.date"),
        key: "updatedAt",
        dataIndex: "updatedAt",
        sorter: {},
        render: (value) => {
          return formatTimestamp(value).dateFormat;
        },
      },
    ],
    [t, sorters, current, pageSize, tableProps]
  );

  return (
    <List
      title={t("voucherHistories.voucherHistories")}
      canCreate={false}
      breadcrumb={false}
    >
      <Table
        {...tableProps}
        rowKey="id"
        columns={columns}
        pagination={{
          ...tableProps.pagination,
          ...tablePaginationSettings,
        }}
        onRow={(record, rowIndex) => {
          return {
            onDoubleClick: (event) => {
              return edit("vouchers", record.voucher.id);
            },
          };
        }}
      />
    </List>
  );
};

// To do: navigate show khi double click vào row
