import { List, NumberField, useTable } from "@refinedev/antd";
import { HttpError, useNavigation, useTranslate } from "@refinedev/core";
import { Popover, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { formatTimestamp } from "../../helpers/timestamp";
import { IOrderFilterVariables, IOrderResponse } from "../../interfaces";
import calculateIndex from "../../utils/common/calculateIndex";
import { OrderStatus } from "../order/OrderStatus";
import { OrderType } from "../order/OrderType";
import OrderDetailsPopover from "../order/OrderDetailsPopover";

const { Text } = Typography;

type CustomerOrderListProps = {
  id: string | undefined;
};

export const CustomerOrderList: React.FC<CustomerOrderListProps> = ({ id }) => {
  const t = useTranslate();
  const { edit } = useNavigation();

  const {
    tableProps,
    current,
    pageSize,
    sorters,
    tableQueryResult: { refetch },
  } = useTable<IOrderResponse, HttpError, IOrderFilterVariables>({
    resource: "orders",
    pagination: {
      pageSize: 5,
    },
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
  });

  const columns = useMemo<ColumnsType<IOrderResponse>>(
    () => [
      {
        title: "#",
        key: "index",
        width: "1rem",
        align: "center",
        render: (value, record, index) =>
          calculateIndex(sorters, current, pageSize, tableProps, index),
      },
      {
        title: t("orders.fields.code"),
        key: "code",
        dataIndex: "code",
        align: "center",
        sorter: {},
        render: (_, { code }) => {
          return <Text>{code ? code : "N/A"}</Text>;
        },
      },
      {
        title: t("orders.fields.status"),
        key: "status",
        dataIndex: "status",
        width: "10%",
        align: "center",
        sorter: {},
        render: (_, { status }) => <OrderStatus status={status} />,
      },
      {
        title: t("orders.fields.type.title"),
        key: "type",
        dataIndex: "type",
        width: "10%",
        align: "center",
        sorter: {},
        render: (_, { type }) => {
          return <OrderType type={type} />;
        },
      },
      {
        title: t("orders.fields.totalPrice"),
        key: "amount",
        dataIndex: "amount",
        align: "end",
        sorter: {},
        render: (_, { totalMoney }) => (
          <NumberField
            options={{
              currency: "VND",
              style: "currency",
            }}
            value={totalMoney}
            locale={"vi"}
          />
        ),
      },
      {
        title: t("orders.fields.orderDetails"),
        key: "orderDetails",
        dataIndex: "orderDetails",
        sorter: {},
        align: "center",
        render: (_, record) => {
          return <OrderDetailsPopover record={record} />;
        },
      },
      {
        title: t("orders.fields.createdAt"),
        key: "createdAt",
        dataIndex: "createdAt",
        defaultSortOrder: "descend",
        sorter: {},
        render: (value) => {
          return formatTimestamp(value).dateFormat;
        },
      },
    ],
    [t, sorters, current, pageSize, tableProps]
  );

  return (
    <List title={t("orders.orders")} canCreate={false}>
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
              return edit("orders", record.id);
            },
          };
        }}
      />
    </List>
  );
};

// To do: navigate show khi double click vào row
