import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useTranslate,
} from "@refinedev/core";
import { Card, Col, Row, Typography, Table } from "antd";
import {
  IReturnFormFilterVariables,
  IReturnFormResponse,
} from "../../interfaces";
import {
  List,
  NumberField,
  getDefaultSortOrder,
  useTable,
} from "@refinedev/antd";
import { useMemo } from "react";
import { ColumnsType } from "antd/es/table";
import { calculateIndex } from "../../utils/common/calculator";
import ColumnActions from "../../components/table/ColumnActions";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { ReturnDeliveryStatus } from "../../components/return/ReturnDeliveryStatus";
import { ReturnRefundStatus } from "../../components/return/ReturnRefundStatus";
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
    onSearch: ({ q }) => {
      const filters: CrudFilters = [];

      filters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
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
        title: "Mã trả hàng",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
        key: "code",
        dataIndex: "code",
        width: "10%",
        align: "center",
      },
      {
        title: "Khách hàng",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("customer", sorters),
        key: "customer",
        dataIndex: ["order", "customer"],
        align: "center",
        render: (value) => {
          return <Text>{value ? value : t("orders.tab.retailCustomer")}</Text>;
        },
      },
      {
        title: "Trạng thái giao hàng",
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
        title: "Trạng thái hoàn tiền",
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
        title: "Loại trả hàng",
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
        title: "Số tiền phải trả",
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
        render: (_, record) => <ColumnActions record={record} />,
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
