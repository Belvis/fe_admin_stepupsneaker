import { List, getDefaultSortOrder, useTable } from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useDelete,
  useTranslate,
} from "@refinedev/core";
import { Avatar, Card, Col, Row, Space, Table, Typography } from "antd";

import { ColumnsType } from "antd/es/table";
import { CustomerStatus } from "../../components/customer/CustomerStatus";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import ColumnActions from "../../components/table/ColumnActions";
import { getCustomerStatusOptions } from "../../constants/status";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { showDangerConfirmDialog } from "../../helpers/confirm";
import { IEmployeeFilterVariables, IEmployeeResponse } from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import { useMemo } from "react";

const { Text } = Typography;

export const EmployeeList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { mutate: mutateDelete } = useDelete();

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IEmployeeResponse,
    HttpError,
    IEmployeeFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const employeeFilters: CrudFilters = [];

      employeeFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      employeeFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return employeeFilters;
    },
  });

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "employees",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
    });
  }

  const columns = useMemo<ColumnsType<IEmployeeResponse>>(
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
        title: t("employees.fields.fullName"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("fullName", sorters),
        dataIndex: "fullName",
        key: "fullName",
        width: 200,
        render: (_, { image, fullName }) => (
          <Space>
            <Avatar size={74} src={image} />
            <Text style={{ wordBreak: "inherit" }}>{fullName}</Text>
          </Space>
        ),
      },
      {
        title: t("employees.fields.gender.label"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("gender", sorters),
        dataIndex: "gender",
        key: "gender",
        render: (value) => (
          <div>{t(`employees.fields.gender.options.${value}`)}</div>
        ),
      },
      {
        title: t("employees.fields.role"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("role", sorters),
        dataIndex: ["role", "name"],
        width: "10%",
        key: "role",
        render: (value) => <div>{t(`roles.${value}`)}</div>,
      },
      {
        title: t("employees.fields.phone"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("phoneNumber", sorters),
        dataIndex: "phoneNumber",
        width: "13%",
        key: "phoneNumber",
      },
      {
        title: t("employees.fields.email"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("email", sorters),
        dataIndex: "email",
        key: "email",
      },
      {
        title: t("employees.fields.address"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("address", sorters),
        dataIndex: "address",
        key: "address",
      },
      {
        title: t("employees.fields.status"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("status", sorters),
        key: "status",
        dataIndex: "status",
        width: "0.5rem",
        align: "center",
        render: (_, { status }) => <CustomerStatus status={status} />,
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
    [t, sorters, current, pageSize]
  );

  return (
    <List>
      <Row gutter={[8, 12]}>
        <Col span={24}>
          <Card>
            <CommonSearchForm
              title={t(`employees.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`employees.filters.search.placeholder`),
                  width: "400px",
                },
                {
                  label: t(`employees.fields.status`),
                  name: "status",
                  placeholder: t(`employees.filters.status.placeholder`),
                  type: "select",
                  options: getCustomerStatusOptions(t),
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
