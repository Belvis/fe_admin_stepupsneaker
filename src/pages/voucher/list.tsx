import {
  DollarOutlined,
  PercentageOutlined,
  StopOutlined,
} from "@ant-design/icons";
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
  useUpdate,
} from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useMemo } from "react";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import ColumnActions from "../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import {
  showDangerConfirmDialog,
  showWarningConfirmDialog,
} from "../../helpers/confirm";
import { formatTimestamp } from "../../helpers/timestamp";
import { IVoucherFilterVariables, IVoucherResponse } from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import { VoucherStatus } from "../../components/voucher/VoucherStatus";
import { getVoucherStatusOptions } from "../../constants/status";

const { Text } = Typography;

export const VoucherList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { mutate: mutateDelete } = useDelete();
  const { mutate: mutateUpdate, isLoading } = useUpdate();

  const {
    tableProps,
    searchFormProps,
    current,
    pageSize,
    sorters,
    tableQueryResult: { refetch },
  } = useTable<IVoucherResponse, HttpError, IVoucherFilterVariables>({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({
      q,
      dateRange,
      priceMax,
      priceMin,
      quantityMax,
      quantityMin,
      status,
      type,
      constraintMin,
      constraintMax,
    }) => {
      const voucherFilters: CrudFilters = [];

      voucherFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });
      voucherFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });
      voucherFilters.push({
        field: "type",
        operator: "eq",
        value: type ? type : undefined,
      });
      voucherFilters.push({
        field: "startDate",
        operator: "eq",
        value:
          dateRange && dateRange.length > 0
            ? dateRange[0].valueOf()
            : undefined,
      });
      voucherFilters.push({
        field: "endDate",
        operator: "eq",
        value:
          dateRange && dateRange.length > 0
            ? dateRange[1].valueOf()
            : undefined,
      });
      voucherFilters.push({
        field: "priceMin",
        operator: "eq",
        value: priceMin ? priceMin : undefined,
      });
      voucherFilters.push({
        field: "priceMax",
        operator: "eq",
        value: priceMax ? priceMax : undefined,
      });
      voucherFilters.push({
        field: "constraintMin",
        operator: "eq",
        value: constraintMin ? constraintMin : undefined,
      });
      voucherFilters.push({
        field: "constraintMax",
        operator: "eq",
        value: constraintMax ? constraintMax : undefined,
      });
      voucherFilters.push({
        field: "quantityMin",
        operator: "eq",
        value: quantityMin ? quantityMin : undefined,
      });
      voucherFilters.push({
        field: "quantityMax",
        operator: "eq",
        value: quantityMax ? quantityMax : undefined,
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
            customButtons={[
              <Tooltip title="Vô hiệu hoá giảm giá">
                <Button
                  loading={isLoading}
                  disabled={
                    record.status === "CANCELLED" ||
                    record.status === "IN_ACTIVE" ||
                    record.status === "EXPIRED"
                  }
                  color="purple"
                  style={{ color: "#800080", borderColor: "#800080" }}
                  size="small"
                  icon={<StopOutlined />}
                  onClick={() => {
                    showWarningConfirmDialog({
                      options: {
                        accept: () => {
                          deactivate(record.id);
                        },
                        reject: () => {},
                      },
                      t: t,
                    });
                  }}
                />
              </Tooltip>,
            ]}
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

  function deactivate(id: string): void {
    mutateUpdate(
      {
        resource: "vouchers/deactivate-discount",
        values: {},
        id,
        successNotification: () => {
          return {
            message: "Vô hiệu hoá giảm giá thành công",
            description: t("common.success"),
            type: "success",
          };
        },
        errorNotification: () => {
          return false;
        },
      },
      {
        onError: (error, variables, context) => {},
        onSuccess: (data, variables, context) => {
          refetch();
        },
      }
    );
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
                {
                  label: "",
                  name: "dateRange",
                  type: "range",
                  width: "400px",
                },
                {
                  label: "",
                  name: "status",
                  type: "select",
                  placeholder: t(`vouchers.filters.status.placeholder`),
                  options: getVoucherStatusOptions(t),
                  width: "200px",
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
                {
                  label: "",
                  name: "type",
                  type: "select",
                  placeholder: "Tìm kiếm theo loại giảm giá",
                  options: [
                    {
                      value: "PERCENTAGE",
                      label: t("vouchers.type.PERCENTAGE"),
                    },
                    {
                      value: "CASH",
                      label: t("vouchers.type.CASH"),
                    },
                  ],
                  width: "200px",
                },
                {
                  label: "Điều kiện tối thiểu",
                  name: "constraintMin",
                  type: "input-number",
                  showLabel: true,
                },
                {
                  label: "Điều kiện tối đa",
                  name: "constraintMax",
                  type: "input-number",
                  showLabel: true,
                },
                {
                  label: "Số lượng tối thiểu",
                  name: "quantityMin",
                  type: "input-number",
                  showLabel: true,
                  useFormatterAndParser: false,
                },
                {
                  label: "Số lượng tối đa",
                  name: "quantityMax",
                  type: "input-number",
                  showLabel: true,
                  useFormatterAndParser: false,
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
