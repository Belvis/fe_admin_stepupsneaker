import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useNavigation,
  useTranslate,
} from "@refinedev/core";

import {
  List,
  NumberField,
  getDefaultSortOrder,
  useTable,
} from "@refinedev/antd";
import { Card, Col, Row, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import { OrderActions } from "../../components/order/OrderActions";
import OrderDetailsPopover from "../../components/order/OrderDetailsPopover";
import { OrderSegmented } from "../../components/order/OrderSegmented";
import { OrderStatus } from "../../components/order/OrderStatus";
import { OrderType } from "../../components/order/OrderType";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { getOrderTypeOptions } from "../../constants/type";
import { formatTimestamp } from "../../helpers/timestamp";
import { IOrderFilterVariables, IOrderResponse } from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";

const { Text } = Typography;

export const OrderList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { show } = useNavigation();

  const {
    tableProps,
    searchFormProps,
    current,
    pageSize,
    tableQueryResult: { refetch },
    sorters,
  } = useTable<IOrderResponse, HttpError, IOrderFilterVariables>({
    onSearch: (params) => {
      const filters: CrudFilters = [];
      const { q, status, priceMin, priceMax, type } = params;

      filters.push({
        field: "q",
        operator: "eq",
        value: q,
      });

      filters.push({
        field: "status",
        operator: "eq",
        value: status,
      });

      filters.push({
        field: "type",
        operator: "eq",
        value: type,
      });

      filters.push({
        field: "priceMin",
        operator: "eq",
        value: priceMin ? priceMin : undefined,
      });

      filters.push({
        field: "priceMax",
        operator: "eq",
        value: priceMax ? priceMax : undefined,
      });

      return filters;
    },
  });

  const columns = useMemo<ColumnsType<IOrderResponse>>(
    () => [
      {
        title: "#",
        key: "createdAt",
        dataIndex: "createdAt",
        align: "center",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
        render: (value, record, index) =>
          calculateIndex(sorters, current, pageSize, tableProps, index),
      },
      {
        title: t("orders.fields.code"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("code", sorters),
        key: "code",
        dataIndex: "code",
        width: "10%",
        align: "center",
        render: (_, { code }) => {
          return (
            <Text strong style={{ color: "#fb5231" }}>
              {code ? code : "N/A"}
            </Text>
          );
        },
      },
      {
        title: t("orders.fields.type.title"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("type", sorters),
        key: "type",
        dataIndex: "type",
        align: "center",
        render: (_, { type }) => {
          return <OrderType type={type} />;
        },
      },
      {
        title: t("orders.fields.status"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("status", sorters),
        key: "status",
        dataIndex: "status",
        align: "center",
        render: (_, { status }) => <OrderStatus status={status} />,
      },
      {
        title: t("orders.fields.totalPrice"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("totalMoney", sorters),
        key: "totalMoney",
        dataIndex: "totalMoney",
        width: "10%",
        align: "end",
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
        title: t("orders.fields.customer"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("customer", sorters),
        key: "customer",
        dataIndex: ["customer"],
        render: (_, { customer }) => {
          return (
            <Text>
              {customer ? customer.fullName : t("orders.tab.retailCustomer")}
            </Text>
          );
        },
      },
      {
        title: t("orders.fields.orderDetails"),
        key: "orderDetails",
        dataIndex: "orderDetails",
        align: "center",
        render: (_, record) => {
          return <OrderDetailsPopover record={record} />;
        },
      },
      {
        title: t("orders.fields.createdAt"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
        key: "createdAt",
        dataIndex: "createdAt",
        align: "right",
        render: (_, { createdAt }) => {
          return <>{formatTimestamp(createdAt).dateFormat}</>;
        },
      },
      {
        title: t("table.actions"),
        dataIndex: "actions",
        key: "actions",
        width: "10%",
        align: "center",
        render: (_, record) => (
          <OrderActions record={record} callBack={refetch} />
        ),
      },
    ],
    [t, sorters, current, pageSize, tableProps]
  );

  return (
    <List>
      <Row gutter={[8, 12]}>
        <Col span={24}>
          <Card>
            <CommonSearchForm
              title={t(`orders.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`orders.filters.search.placeholder`),
                },
                {
                  label: t(`orders.fields.status`),
                  name: "status",
                  placeholder: t(`orders.filters.status.placeholder`),
                  hidden: true,
                  type: "select",
                  options: [],
                },
                {
                  label: t(`orders.fields.type`),
                  name: "type",
                  placeholder: t(`orders.filters.type.placeholder`),
                  type: "select",
                  options: getOrderTypeOptions(t),
                  width: "100%",
                },
                {
                  label: t(`productDetails.filters.priceMin.label`),
                  name: "priceMin",
                  type: "input-number",
                  showLabel: true,
                },
                {
                  label: t(`productDetails.filters.priceMax.label`),
                  name: "priceMax",
                  type: "input-number",
                  showLabel: true,
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card>
            <OrderSegmented formProps={searchFormProps} callBack={refetch} />
          </Card>
        </Col>
        <Col span={24}>
          <Table
            {...tableProps}
            pagination={{
              ...tableProps.pagination,
              ...tablePaginationSettings,
            }}
            rowKey="id"
            columns={columns}
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  show("orders", record.id);
                },
              };
            }}
          />
        </Col>
      </Row>
    </List>
  );
};
