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
import { ReturnDeliveryStatus } from "../../components/return/ReturnDeliveryStatus";
import { ReturnRefundStatus } from "../../components/return/ReturnRefundStatus";
import ColumnActions from "../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import {
  ICustomerResponse,
  IReturnFormFilterVariables,
  IReturnFormResponse,
} from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import {
  getDeliveryStatusOptions,
  getRefundStatusOptions,
} from "../../constants/status";
import {
  getReturnPaymentTypeOptions,
  getReturnTypeOptions,
} from "../../constants/type";
import { OrderType } from "../../components/order/OrderType";

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
    onSearch: ({ q, deliveryStatus, paymentType, refundStatus, type }) => {
      const filters: CrudFilters = [];

      filters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });
      filters.push({
        field: "deliveryStatus",
        operator: "eq",
        value: deliveryStatus ? deliveryStatus : undefined,
      });
      filters.push({
        field: "paymentType",
        operator: "eq",
        value: paymentType ? paymentType : undefined,
      });
      filters.push({
        field: "refundStatus",
        operator: "eq",
        value: refundStatus ? refundStatus : undefined,
      });
      filters.push({
        field: "type",
        operator: "eq",
        value: type ? type : undefined,
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
        defaultSortOrder: getDefaultSortOrder("type", sorters),
        key: "type",
        dataIndex: "type",
        align: "center",
        render: (value) => {
          return <OrderType type={value} />;
        },
      },
      {
        title: t("return-forms.fields.returnDeliveryStatus.label"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("returnDeliveryStatus", sorters),
        key: "returnDeliveryStatus",
        dataIndex: "returnDeliveryStatus",
        align: "center",
        render: (value) => {
          return <ReturnDeliveryStatus status={value} />;
        },
      },
      {
        title: t("return-forms.fields.refundStatus.label"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("refundStatus", sorters),
        key: "refundStatus",
        dataIndex: "refundStatus",
        align: "center",
        render: (value) => {
          return <ReturnRefundStatus status={value} />;
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
                  width: "200px",
                },
                {
                  label: t(`return-forms.filters.deliveryStatus.label`),
                  name: "deliveryStatus",
                  placeholder: t(
                    `return-forms.filters.deliveryStatus.placeholder`
                  ),
                  type: "select",
                  options: getDeliveryStatusOptions(t),
                  width: "300px",
                },
                {
                  label: t(`return-forms.filters.refundStatus.label`),
                  name: "refundStatus",
                  placeholder: t(
                    `return-forms.filters.refundStatus.placeholder`
                  ),
                  type: "select",
                  options: getRefundStatusOptions(t),
                  width: "250px",
                },
                {
                  label: t(`return-forms.filters.type.label`),
                  name: "type",
                  placeholder: t(`return-forms.filters.type.placeholder`),
                  type: "select",
                  options: getReturnTypeOptions(t),
                  width: "200px",
                },
                {
                  label: t(`return-forms.filters.paymentType.label`),
                  name: "paymentType",
                  placeholder: t(
                    `return-forms.filters.paymentType.placeholder`
                  ),
                  type: "select",
                  options: getReturnPaymentTypeOptions(t),
                  width: "300px",
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
