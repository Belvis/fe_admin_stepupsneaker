import { DollarOutlined, PercentageOutlined } from "@ant-design/icons";
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
  useDelete,
  useTranslate,
} from "@refinedev/core";
import { Avatar, Card, Col, Row, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useMemo } from "react";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import ColumnActions from "../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { showDangerConfirmDialog } from "../../helpers/confirm";
import { formatTimestamp } from "../../helpers/timestamp";
import { IVoucherFilterVariables, IVoucherResponse } from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import { VoucherStatus } from "../../components/voucher/VoucherStatus";

const { Text } = Typography;

export const VoucherList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { mutate: mutateDelete } = useDelete();

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IVoucherResponse,
    HttpError,
    IVoucherFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q }) => {
      const voucherFilters: CrudFilters = [];

      voucherFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return voucherFilters;
    },
  });

  const columns = useMemo<ColumnsType<IVoucherResponse>>(
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
        title: t("vouchers.fields.code"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("code", sorters),
        dataIndex: "code",
        key: "code",
      },
      {
        title: t("vouchers.fields.name"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("name", sorters),
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (_, { image, name }) => (
          <Space>
            <Avatar shape="square" size={74} src={image} />
            <Text style={{ wordBreak: "inherit" }}>{name}</Text>
          </Space>
        ),
      },
      {
        title: t("vouchers.fields.type"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("type", sorters),
        dataIndex: "type",
        key: "type",
        width: "0.5rem",
        align: "center",
        render: (_, record) => {
          const icon =
            record.type === "PERCENTAGE" ? (
              <PercentageOutlined style={{ fontSize: 24 }} />
            ) : (
              <DollarOutlined style={{ fontSize: 24 }} />
            );
          return <div className="d-flex justify-content-center">{icon}</div>;
        },
      },
      {
        title: t("vouchers.fields.value"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("value", sorters),
        dataIndex: "value",
        key: "value",
        render: (_, record) =>
          record.type === "CASH" ? (
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
                notation: "standard",
              }}
              value={record.value}
              locale={"vi"}
            />
          ) : (
            record.value + "%"
          ),
      },
      {
        title: t("vouchers.fields.constraint"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("constraint", sorters),
        dataIndex: "constraint",
        key: "constraint",
        render: (value) => (
          <NumberField
            options={{
              currency: "VND",
              style: "currency",
              notation: "standard",
            }}
            locale={"vi"}
            value={value}
          />
        ),
      },
      {
        title: t("vouchers.fields.quantity"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("quantity", sorters),
        dataIndex: "quantity",
        width: "1rem",
        key: "quantity",
      },
      {
        title: t("vouchers.fields.startDate"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("startDate", sorters),
        dataIndex: "startDate",
        key: "startDate",
        render: (_, record) => {
          return <>{formatTimestamp(record.startDate).dateTimeFormat}</>;
        },
      },
      {
        title: t("vouchers.fields.endDate"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("endDate", sorters),
        dataIndex: "endDate",
        key: "endDate",
        render: (_, record) => {
          return <>{formatTimestamp(record.endDate).dateTimeFormat}</>;
        },
      },
      {
        title: t("vouchers.fields.status"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("status", sorters),
        dataIndex: "status",
        key: "status",
        render: (value) => {
          return <VoucherStatus status={value} />;
        },
      },
      {
        title: t("table.actions"),
        dataIndex: "actions",
        key: "actions",
        width: "10%",
        align: "center",
        render: (_, record) => (
          <ColumnActions
            hideShow
            record={record}
            onDeleteClick={() => handleDelete(record.id)}
          />
        ),
      },
    ],
    [t, sorters, current, pageSize, tableProps]
  );

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "vouchers",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
    });
  }

  return (
    <List>
      <Row gutter={[8, 12]}>
        <Col span={24}>
          <Card>
            <CommonSearchForm
              title={t(`vouchers.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`vouchers.filters.search.placeholder`),
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
