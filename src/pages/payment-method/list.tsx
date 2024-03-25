import { List, getDefaultSortOrder, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useTranslate,
} from "@refinedev/core";
import { Card, Col, Row, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import CommonSearchForm from "../../components/form/CommonSearchForm";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import {
  IPaymentMethodFilterVariables,
  IPaymentMethodResponse,
} from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import { useMemo } from "react";

export const PaymentMethodList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IPaymentMethodResponse,
    HttpError,
    IPaymentMethodFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q }) => {
      const paymentMethodFilters: CrudFilters = [];

      paymentMethodFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return paymentMethodFilters;
    },
  });

  const columns = useMemo<ColumnsType<IPaymentMethodResponse>>(
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
        title: t("payment-methods.fields.name"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("name", sorters),
        dataIndex: "name",
        key: "name",
        render: (value) => <div>{t(`paymentMethods.options.${value}`)}</div>,
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
