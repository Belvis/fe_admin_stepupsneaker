import {
  List,
  NumberField,
  getDefaultSortOrder,
  useTable,
} from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useTranslate,
} from "@refinedev/core";
import { Card, Col, Row, Table, Typography } from "antd";

import { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { formatTimestamp } from "../../helpers/timestamp";
import { IPaymentFilterVariables, IPaymentResponse } from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";

const { Text } = Typography;

export const PaymentList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IPaymentResponse,
    HttpError,
    IPaymentFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q }) => {
      const customerFilters: CrudFilters = [];

      customerFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return customerFilters;
    },
  });

  const columns = useMemo<ColumnsType<IPaymentResponse>>(
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
        title: t("payments.fields.customer"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("customer", sorters),
        dataIndex: ["order", "customer"],
        key: "customer",
        width: 300,
        render: (_, { order }) => {
          return (
            <Text style={{ wordBreak: "inherit" }}>
              {order?.customer?.fullName || t("payments.retailCustomer")}
            </Text>
          );
        },
      },
      {
        title: t("payments.fields.order"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("order.code", sorters),
        dataIndex: ["order", "code"],
        key: "order",
        render: (_, { order }) => <Text>{order?.code}</Text>,
      },
      {
        title: t("payments.fields.totalMoney"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("totalMoney", sorters),
        dataIndex: "totalMoney",
        key: "totalMoney",
        render: (_, record) => (
          <NumberField
            options={{
              currency: "VND",
              style: "currency",
            }}
            value={record.totalMoney}
            locale={"vi"}
          />
        ),
      },
      {
        title: t("payments.fields.paymentMethod"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("paymentMethod.name", sorters),
        dataIndex: "paymentMethod.name",
        align: "center",
        key: "paymentMethod.name",
        render: (_, record) => (
          <Text style={{ wordBreak: "inherit" }}>
            {t(`paymentMethods.options.${record.paymentMethod.name}`)}
          </Text>
        ),
      },
      {
        title: t("payments.fields.transactionCode"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("transactionCode", sorters),
        dataIndex: "transactionCode",
        key: "transactionCode",
        render: (value) => (
          <Text style={{ wordBreak: "inherit" }}>
            {value == "PENDING" ? t("payments.pending") : value}
          </Text>
        ),
      },
      {
        title: t("payments.fields.createdAt"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("updatedAt", sorters),
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (value) => {
          return <>{formatTimestamp(value).dateFormat}</>;
        },
      },
    ],
    [t, sorters, current, pageSize]
  );

  return (
    <List canCreate={false}>
      <Row gutter={[8, 12]} align="middle" justify="center">
        <Col span={24}>
          <Card>
            <CommonSearchForm
              title={t(`payments.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`payments.filters.search.placeholder`),
                  width: "400px",
                },
              ]}
            />
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
          />
        </Col>
      </Row>
    </List>
  );
};
