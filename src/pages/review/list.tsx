import { List, getDefaultSortOrder, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useResource,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  IEmployeeFilterVariables,
  IReviewFilterVariables,
  IReviewResponse,
  ReviewStatus as IReviewStatus,
} from "../../interfaces";
import { useMemo } from "react";
import { ColumnsType } from "antd/es/table";
import { calculateIndex } from "../../utils/common/calculator";
import {
  Button,
  Card,
  Col,
  Rate,
  Row,
  Space,
  Tooltip,
  Table,
  Image,
} from "antd";
import { ReviewStatus } from "../../components/review/ReviewStatus";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";

export const ReviewList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { mutate, isLoading } = useUpdate();
  const { resource, resources } = useResource();

  const handleAction = (record: IReviewResponse, status: IReviewStatus) => {
    mutate(
      {
        resource: resource?.name ?? "",
        id: record.id,
        values: {
          status,
        },
        successNotification: (data, values, resource) => {
          return {
            message: t("common.update.success"),
            description: t("common.success"),
            type: "success",
          };
        },
        errorNotification: (error, values, resource) => {
          return {
            message: t("common.error") + error?.message,
            description: "Oops!..",
            type: "error",
          };
        },
      },
      {
        onError: (error, variables, context) => {},
        onSuccess: (data, variables, context) => {
          refetch();
        },
      }
    );
  };

  const {
    tableProps,
    searchFormProps,
    current,
    pageSize,
    sorters,
    tableQueryResult: { refetch },
  } = useTable<IReviewResponse, HttpError, IReviewFilterVariables>({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, hasMedia, rating }) => {
      const filters: CrudFilters = [];

      filters.push({
        field: "q",
        operator: "eq",
        value: q ? q.trim() : undefined,
      });
      filters.push({
        field: "hasMedia",
        operator: "eq",
        value: hasMedia ? hasMedia : undefined,
      });
      filters.push({
        field: "rating",
        operator: "eq",
        value: rating ? rating : undefined,
      });

      return filters;
    },
  });

  const columns = useMemo<ColumnsType<IReviewResponse>>(
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
        title: t("product/reviews.fields.customer"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("customer", sorters),
        dataIndex: ["customer", "fullName"],
        key: "customer",
      },
      {
        title: t("product/reviews.fields.rating"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("rating", sorters),
        dataIndex: "rating",
        key: "rating",
        align: "center",
        render: (value) => <Rate value={value} disabled />,
      },
      {
        title: t("product/reviews.fields.comment"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("comment", sorters),
        dataIndex: "comment",
        key: "comment",
      },
      {
        title: t("product/reviews.fields.urlImage"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("urlImage", sorters),
        dataIndex: "urlImage",
        key: "urlImage",
        align: "center",
        render: (value) => <Image src={value} width={100} />,
      },
      {
        title: t("table.actions"),
        dataIndex: "actions",
        key: "actions",
        width: "10%",
        align: "center",
        render: (_, record) => (
          <Space size="middle">
            <Button
              loading={isLoading}
              key="accept"
              disabled={record.status !== "WAITING"}
              icon={
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: 17, fontWeight: 500 }}
                />
              }
              onClick={() => handleAction(record, "ACCEPTED")}
            >
              {t("buttons.accept")}
            </Button>
            <Button
              loading={isLoading}
              key="reject"
              icon={
                <CloseCircleOutlined
                  style={{ color: "#EE2A1E", fontSize: 17 }}
                />
              }
              disabled={record.status !== "WAITING"}
              onClick={() => handleAction(record, "REJECTED")}
            >
              {t("buttons.reject")}
            </Button>
          </Space>
        ),
      },
    ],
    [t, sorters, current, pageSize]
  );

  return (
    <List canCreate={false}>
      <Row gutter={[8, 12]}>
        <Col span={24}>
          <Card>
            <CommonSearchForm
              title={t(`product/reviews.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`product/reviews.filters.search.placeholder`),
                  width: "300px",
                },
                {
                  label: "",
                  name: "hasMedia",
                  type: "select",
                  placeholder: "Tìm kiếm theo tệp đính kèm",
                  options: [
                    {
                      value: "false",
                      label: "Không có đính kèm",
                    },
                    {
                      value: "true",
                      label: "Có đính kèm",
                    },
                  ],
                  width: "200px",
                },
                {
                  label: "Đánh giá",
                  name: "rating",
                  type: "rate",
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
