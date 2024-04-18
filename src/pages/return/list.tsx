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
import ColumnActions from "../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { getReturnPaymentTypeOptions } from "../../constants/type";
import {
  ICustomerResponse,
  IReturnFormFilterVariables,
  IReturnFormResponse,
} from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";

const { Text } = Typography;

export const ReturnList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IReturnFormResponse,
    HttpError,
    IReturnFormFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, paymentType, priceMax, priceMin }) => {
      const filters: CrudFilters = [];

      filters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });
      filters.push({
        field: "paymentType",
        operator: "eq",
        value: paymentType ? paymentType : undefined,
      });
      filters.push({
        field: "priceMax",
        operator: "eq",
        value: priceMax ? priceMax : undefined,
      });
      filters.push({
        field: "priceMin",
        operator: "eq",
        value: priceMin ? priceMin : undefined,
      });

      return filters;
    },
  });

  const columns = useMemo<ColumnsType<IReturnFormResponse>>(
    () => [
      {
        title: "#",
        key: "createdAt",
        dataIndex: "createdAt",
        align: "center",
        sorter: {},
        width: "1rem",
        defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
        render: (value, record, index) =>
          calculateIndex(sorters, current, pageSize, tableProps, index),
      },
      {
        title: t("return-forms.fields.code"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
        key: "code",
        dataIndex: "code",
        width: "10%",
        align: "center",
      },
      {
        title: t("return-forms.fields.customer.label"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("customer", sorters),
        key: "customer",
        dataIndex: ["order", "customer"],
        align: "center",
        render: (value: ICustomerResponse) => {
          return (
            <Text>
              {value ? value.fullName : t("orders.tab.retailCustomer")}
            </Text>
          );
        },
      },
      {
        title: t("return-forms.fields.type.label"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("paymentType", sorters),
        key: "paymentType",
        dataIndex: "paymentType",
        align: "center",
        render: (value) => {
          return t(`return-forms.fields.paymentType.${value}`);
        },
      },
      {
        title: t("return-forms.fields.amountToBePaid"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("amountToBePaid", sorters),
        key: "amountToBePaid",
        dataIndex: "amountToBePaid",
        align: "center",
        render: (value) => {
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
        title: t("table.actions"),
        dataIndex: "actions",
        key: "actions",
        width: "10%",
        align: "center",
        render: (_, record) => (
          <ColumnActions hideDelete hideEdit record={record} />
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
              title={t(`return-forms.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`return-forms.filters.search.placeholder`),
                  width: "150px",
                },
                {
                  label: t(`return-forms.filters.paymentType.label`),
                  name: "paymentType",
                  placeholder: t(
                    `return-forms.filters.paymentType.placeholder`
                  ),
                  type: "select",
                  options: getReturnPaymentTypeOptions(t),
                  width: "150px",
                },
                {
                  label: "Giá trị tối thiểu",
                  name: "priceMin",
                  type: "input-number",
                  showLabel: true,
                },
                {
                  label: "Giá trị tối đa",
                  name: "priceMax",
                  type: "input-number",
                  showLabel: true,
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
