import { List, getDefaultSortOrder, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useDelete,
  useTranslate,
} from "@refinedev/core";
import { Avatar, Card, Col, Row, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import CommonSearchForm from "../../components/form/CommonSearchForm";
import { PromotionStatus } from "../../components/promotion/PromotionStatus";
import ColumnActions from "../../components/table/ColumnActions";
import { getProductStatusOptions } from "../../constants/status";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { showDangerConfirmDialog } from "../../helpers/confirm";
import { formatTimestamp } from "../../helpers/timestamp";
import {
  IPromotionFilterVariables,
  IPromotionResponse,
} from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";

const { Text } = Typography;

export const PromotionList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { mutate: mutateDelete } = useDelete();

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IPromotionResponse,
    HttpError,
    IPromotionFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const promotionFilter: CrudFilters = [];

      promotionFilter.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      promotionFilter.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
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
      key: "status",
      dataIndex: "status",
      width: "0.5rem",
      align: "center",
      render: (_, { status }) => <PromotionStatus status={status} />,
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
                  label: t(`promotions.fields.status`),
                  name: "status",
                  placeholder: t(`promotions.filters.status.placeholder`),
                  type: "select",
                  options: getProductStatusOptions(t),
                  width: "200px",
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
