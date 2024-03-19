import {
  List,
  getDefaultSortOrder,
  useModalForm,
  useTable,
} from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useTranslate,
} from "@refinedev/core";
import { Card, Col, Row, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CreateRole } from "./create";
import { EditRole } from "./edit";

import { useMemo } from "react";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { IRoleFilterVariables, IRoleResponse } from "../../interfaces";
import calculateIndex from "../../utils/common/calculateIndex";

export const RoleList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IRoleResponse,
    HttpError,
    IRoleFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q }) => {
      const roleFilters: CrudFilters = [];

      roleFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return roleFilters;
    },
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IRoleResponse>({
    onMutationSuccess: () => {
      createFormProps.form?.resetFields();
    },
    action: "create",
    warnWhenUnsavedChanges: true,
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    onFinish: editOnFinish,
  } = useModalForm<IRoleResponse>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const columns = useMemo<ColumnsType<IRoleResponse>>(
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
        title: t("roles.fields.name"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("name", sorters),
        dataIndex: "name",
        key: "name",
        render: (value) => <div>{t(`roles.${value}`)}</div>,
      },
    ],
    [t, sorters, current, pageSize]
  );

  return (
    <List
      canCreate={false}
      createButtonProps={{
        onClick: () => {
          createModalShow();
        },
      }}
    >
      <Row gutter={[8, 12]} align="middle" justify="center">
        <Col span={24}>
          <Card>
            <CommonSearchForm
              title={t(`roles.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`roles.filters.search.placeholder`),
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

      <CreateRole
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
      <EditRole
        onFinish={editOnFinish}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
