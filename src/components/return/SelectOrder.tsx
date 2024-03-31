import {
  NumberField,
  getDefaultSortOrder,
  useModal,
  useTable,
} from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useApiUrl,
  useTranslate,
} from "@refinedev/core";
import { Button, Card, Col, Row, Table, Typography } from "antd";

import { ColumnsType } from "antd/es/table";
import { useContext, useMemo } from "react";
import { getOrderTypeOptions } from "../../constants/type";
import { formatTimestamp } from "../../helpers/timestamp";
import { IOrderFilterVariables, IOrderResponse } from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import CommonSearchForm from "../form/CommonSearchForm";
import OrderDetailsPopover from "../order/OrderDetailsPopover";
import { OrderStatus } from "../order/OrderStatus";
import { OrderType } from "../order/OrderType";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { ReturnFormContext } from "../../contexts/return";
import { QrcodeOutlined } from "@ant-design/icons";
import { parseQRCodeResult } from "../../helpers/qrCode";
import { QRScannerModal } from "../qr-scanner/QRScannerModal";
import { dataProvider } from "../../providers/dataProvider";

const { Text } = Typography;
export const SelectOrder: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();
  const { getOne } = dataProvider(API_URL);

  const { next, setSelectedOrder } = useContext(ReturnFormContext);

  const {
    tableProps,
    searchFormProps,
    current,
    pageSize,
    tableQueryResult: { refetch },
    sorters,
  } = useTable<IOrderResponse, HttpError, IOrderFilterVariables>({
    resource: "orders",
    filters: {
      permanent: [
        {
          field: "status",
          operator: "eq",
          value: "COMPLETED",
        },
      ],
    },
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
              {code ? code.toUpperCase() : "N/A"}
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
          <Button
            onClick={() => {
              setSelectedOrder(record);
              next();
            }}
          >
            {t("buttons.choose")}
          </Button>
        ),
      },
    ],
    [t, sorters, current, pageSize, tableProps]
  );

  const {
    show: scanShow,
    close: scanClose,
    modalProps: scanModalProps,
  } = useModal();

  const handleScanSuccess = async (result: string) => {
    const { data } = await getOne({ resource: "orders", id: result });
    if (data) {
      setSelectedOrder(data as IOrderResponse);
      next();
    }
  };

  return (
    <Row gutter={[8, 12]}>
      <Col span={24} className="d-flex justify-content-between">
        <Text className="h6 m-0">{t("orders.titles.list")}</Text>
        <Button
          icon={<QrcodeOutlined />}
          type="default"
          onClick={() => {
            scanShow();
          }}
        >
          {t("buttons.scanQR")}
        </Button>
      </Col>
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

      {scanModalProps.open && (
        <QRScannerModal
          modalProps={scanModalProps}
          close={scanClose}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </Row>
  );
};
