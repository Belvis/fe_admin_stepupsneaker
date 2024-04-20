import { List, getDefaultSortOrder, useTable } from "@refinedev/antd";
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

import CommonSearchForm from "../../components/form/CommonSearchForm";
import ColumnActions from "../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import {
  showDangerConfirmDialog,
  showWarningConfirmDialog,
} from "../../helpers/confirm";
import { formatTimestamp } from "../../helpers/timestamp";
import {
  IPromotionFilterVariables,
  IPromotionResponse,
} from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import { PromotionStatus } from "../../components/promotion/PromotionStatus";
import { getProductStatusOptions } from "../../constants/status";
import { StopOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const PromotionList: React.FC<IResourceComponentsProps> = () => {
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
  } = useTable<IPromotionResponse, HttpError, IPromotionFilterVariables>({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, dateRange, priceMax, priceMin, status }) => {
      const promotionFilter: CrudFilters = [];

      promotionFilter.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });
      promotionFilter.push({
        field: "startDate",
        operator: "eq",
        value:
          dateRange && dateRange.length > 0
            ? dateRange[0].valueOf()
            : undefined,
      });
      promotionFilter.push({
        field: "endDate",
        operator: "eq",
        value:
          dateRange && dateRange.length > 0
            ? dateRange[1].valueOf()
            : undefined,
      });
      promotionFilter.push({
        field: "priceMin",
        operator: "eq",
        value: priceMin ? priceMin : undefined,
      });
      promotionFilter.push({
        field: "priceMax",
        operator: "eq",
        value: priceMax ? priceMax : undefined,
      });
      promotionFilter.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      return promotionFilter;
    },
  });

  const columns: ColumnsType<IPromotionResponse> = [
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
      title: t("promotions.fields.code"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("code", sorters),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("promotions.fields.name"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("name", sorters),
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (_, { image, name }) => (
        <Space>
          <Avatar shape="square" size={74} src={image} />
          <Text style={{ wordBreak: "inherit" }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: t("promotions.fields.value"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("value", sorters),
      dataIndex: "value",
      key: "value",
    },
    {
      title: t("promotions.fields.startDate"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("startDate", sorters),
      dataIndex: "startDate",
      key: "startDate",
      render: (_, record) => {
        return <>{formatTimestamp(record.startDate).dateTimeFormat}</>;
      },
    },
    {
      title: t("promotions.fields.endDate"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("endDate", sorters),
      dataIndex: "endDate",
      key: "endDate",
      render: (_, record) => {
        return <>{formatTimestamp(record.endDate).dateTimeFormat}</>;
      },
    },
    {
      title: t("promotions.fields.status"),
      sorter: {},
      defaultSortOrder: getDefaultSortOrder("status", sorters),
      dataIndex: "status",
      key: "status",
      render: (value) => {
        return <PromotionStatus status={value} />;
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
                disabled={
                  record.status === "CANCELLED" ||
                  record.status === "IN_ACTIVE" ||
                  record.status === "EXPIRED"
                }
                loading={isLoading}
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
  ];

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "promotions",
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
        resource: "promotions/deactivate-discount",
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
              title={t(`promotions.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`promotions.filters.search.placeholder`),
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
                  options: getProductStatusOptions(t),
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
