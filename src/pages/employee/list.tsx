import { SyncOutlined } from "@ant-design/icons";
import {
  List,
  getDefaultSortOrder,
  useSelect,
  useTable,
} from "@refinedev/antd";
import {
  CrudFilters,
  HttpError,
  IResourceComponentsProps,
  useDelete,
  useTranslate,
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

import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { ChangePassword } from "../../components/employee/ModalEditPassword";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import ColumnActions from "../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { showDangerConfirmDialog } from "../../helpers/confirm";
import {
  IEmployeeFilterVariables,
  IEmployeeResponse,
  IRoleResponse,
} from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import { getCustomerGenderOptions } from "../../constants/gender";
const { Text } = Typography;

export const EmployeeList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { mutate: mutateDelete } = useDelete();
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployeeResponse>();
  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    IEmployeeResponse,
    HttpError,
    IEmployeeFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, gender, role }) => {
      const employeeFilters: CrudFilters = [];

      employeeFilters.push({
        field: "gender",
        operator: "eq",
        value: gender ? gender : undefined,
      });
      employeeFilters.push({
        field: "role",
        operator: "eq",
        value: role ? role : undefined,
      });
      employeeFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q.trim() : undefined,
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
  const showChangePasswordModal = (employee: IEmployeeResponse) => {
    setSelectedEmployee(employee);
    setOpenChangePasswordModal(true);
  };

  const handleOk = () => {
    setOpenChangePasswordModal(false);
  };

  const handleCancel = () => {
    setOpenChangePasswordModal(false);
  };

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
              <Tooltip title={t("employees.buttons.changePassword")}>
                <Button
                  style={{ color: "#000000", borderColor: "#000000" }}
                  size="small"
                  icon={<SyncOutlined />}
                  onClick={() => {
                    showChangePasswordModal(record);
                  }}
                />
              </Tooltip>,
            ]}
          />
        ),
      },
    ],
    [t, sorters, current, pageSize]
  );

  const { selectProps: roleSelectProps } = useSelect<IRoleResponse>({
    resource: "roles",
    optionLabel: "name",
    optionValue: "id",
  });

  const renderOptions = () => {
    if (!roleSelectProps.options) return [];

    return roleSelectProps.options.map((option) => ({
      ...option,
      label: t(`roles.${option.label}`),
    }));
  };

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
                  width: "300px",
                },
                {
                  label: "",
                  name: "gender",
                  placeholder: t(`customers.filters.gender.placeholder`),
                  type: "select",
                  options: getCustomerGenderOptions(t),
                  width: "100%",
                },
                {
                  label: "",
                  name: "role",
                  placeholder: "Tìm kiếm theo chức vụ",
                  type: "select",
                  options: renderOptions(),
                  width: "100%",
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
      {selectedEmployee && (
        <ChangePassword
          employee={selectedEmployee}
          handleCancel={handleCancel}
          openChangePasswordModal={openChangePasswordModal}
        />
      )}
    </List>
  );
};
