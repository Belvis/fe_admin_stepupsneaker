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
  useTranslate,
} from "@refinedev/core";
import { Card, Col, ColorPicker, Row, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CreateColor } from "./create";
import { EditColor } from "./edit";

import { useMemo } from "react";
import CommonSearchForm from "../../../components/form/CommonSearchForm";
import ColumnActions from "../../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../../constants/tablePaginationConfig";
import { showDangerConfirmDialog } from "../../../helpers/confirm";
import {
  IColorResponse,
  IProdAttributeFilterVariables,
} from "../../../interfaces";
import { calculateIndex } from "../../../utils/common/calculator";
import { colorPickerStyles } from "./style";

export const ColorList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { mutate: mutateDelete } = useDelete();
  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IColorResponse,
    HttpError,
    IProdAttributeFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q }) => {
      const colorFilters: CrudFilters = [];

      colorFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return colorFilters;
    },
  });

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
  } = useModalForm<IColorResponse>({
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
    close: editClose,
  } = useModalForm<IColorResponse>({
    action: "edit",
    warnWhenUnsavedChanges: true,
  });

  const columns = useMemo<ColumnsType<IColorResponse>>(
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
        title: t("colors.fields.code"),
        dataIndex: "code",
        key: "code",
        align: "center",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("code", sorters),
        render: (_, { code }) => (
          <ColorPicker
            style={colorPickerStyles}
            value={code}
            showText
            disabled
          />
        ),
      },
      {
        title: t("colors.fields.name"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("name", sorters),
        dataIndex: "name",
        key: "name",
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
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "colors",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
    });
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
              title={t(`colors.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`colors.filters.search.placeholder`),
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

      <CreateColor
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
      />
      <EditColor
        onFinish={editOnFinish}
        close={editClose}
        id={editId}
        modalProps={editModalProps}
        formProps={editFormProps}
      />
    </List>
  );
};
