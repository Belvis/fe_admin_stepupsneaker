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
  useDelete,
  useResource,
  useTranslate,
} from "@refinedev/core";
import { Card, Col, Row, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useMemo } from "react";
import CommonSearchForm from "../../../components/form/CommonSearchForm";
import { CreateProdAttribute } from "../../../components/product/CreateProdAttribute";
import { ProductStatus } from "../../../components/product/ProductStatus";
import ColumnActions from "../../../components/table/ColumnActions";
import { getProductStatusOptions } from "../../../constants/status";
import { tablePaginationSettings } from "../../../constants/tablePaginationConfig";
import { showDangerConfirmDialog } from "../../../helpers/confirm";
import {
  IProdAttributeFilterVariables,
  IProdAttributeResponse,
} from "../../../interfaces";
import calculateIndex from "../../../utils/common/calculateIndex";
import { EditProdAttribute } from "../../../components/product/EditProdAttribute";

export const ProdAttributeList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { resource } = useResource();

  const { mutate: mutateDelete } = useDelete();

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IProdAttributeResponse,
    HttpError,
    IProdAttributeFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, status }) => {
      const ProdAttributeFilters: CrudFilters = [];

      ProdAttributeFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      ProdAttributeFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return ProdAttributeFilters;
    },
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IProdAttributeResponse>({
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
    id: editId,
    onFinish: editOnFinish,
  } = useModalForm<IProdAttributeResponse>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const columns = useMemo<ColumnsType<IProdAttributeResponse>>(
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
        title: t(`${resource?.name}.fields.name`),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("name", sorters),
        dataIndex: "name",
        key: "name",
      },
      {
        title: t(`${resource?.name}.fields.status`),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("status", sorters),
        key: "status",
        dataIndex: "status",
        align: "center",
        render: (_, { status }) => <ProductStatus status={status} />,
      },
      {
        title: t("table.actions"),
        dataIndex: "actions",
        key: "actions",
        align: "center",
        render: (_, record) => (
          <ColumnActions
            hideShow
            record={record}
            onEditClick={() => editModalShow(record.id)}
            onDeleteClick={() => handleDelete(record.id)}
          />
        ),
      },
    ],
    [t, sorters, current, pageSize]
  );

  function handleDelete(id: string): void {
    if (resource) {
      showDangerConfirmDialog({
        options: {
          accept: () => {
            mutateDelete({
              resource: resource?.name,
              id: id,
            });
          },
          reject: () => {},
        },
        t: t,
      });
    }
  }

  return (
    <List
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
              title={t(`${resource?.name}.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(
                    `${resource?.name}.filters.search.placeholder`
                  ),
                  width: "400px",
                },
                {
                  label: t(`${resource?.name}.fields.status`),
                  name: "status",
                  placeholder: t(
                    `${resource?.name}.filters.status.placeholder`
                  ),
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

      <CreateProdAttribute
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
      <EditProdAttribute
        onFinish={editOnFinish}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
