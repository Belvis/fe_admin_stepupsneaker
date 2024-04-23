import { IdcardOutlined } from "@ant-design/icons";
import { List, getDefaultSortOrder, useTable } from "@refinedev/antd";
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
import { AddressModal } from "../../components/address/AddressModal";
import CommonSearchForm from "../../components/form/CommonSearchForm";
import ColumnActions from "../../components/table/ColumnActions";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { showDangerConfirmDialog } from "../../helpers/confirm";
import { formatTimestamp } from "../../helpers/timestamp";
import { ICustomerFilterVariables, ICustomerResponse } from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import { getCustomerGenderOptions } from "../../constants/gender";

const { Text } = Typography;

export const CustomerList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { mutate: mutateDelete } = useDelete();
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomerResponse>();

  const showAddressModal = (customer: ICustomerResponse) => {
    setSelectedCustomer(customer);
    setOpenAddressModal(true);
  };

  const handleOk = () => {
    setOpenAddressModal(false);
  };

  const handleCancel = () => {
    setOpenAddressModal(false);
  };

  const { tableProps, searchFormProps, current, pageSize, sorters } = useTable<
    ICustomerResponse,
    HttpError,
    ICustomerFilterVariables
  >({
    pagination: {
      pageSize: 5,
    },
    onSearch: ({ q, gender, dateRange }) => {
      const customerFilters: CrudFilters = [];

      customerFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      customerFilters.push({
        field: "gender",
        operator: "eq",
        value: gender ? gender : undefined,
      });

      customerFilters.push({
        field: "startDate",
        operator: "eq",
        value:
          dateRange && dateRange.length > 0
            ? dateRange[0].startOf("day").valueOf()
            : undefined,
      });
      customerFilters.push({
        field: "endDate",
        operator: "eq",
        value:
          dateRange && dateRange.length > 0
            ? dateRange[1].endOf("day").valueOf()
            : undefined,
      });

      return customerFilters;
    },
  });

  function handleDelete(id: string): void {
    showDangerConfirmDialog({
      options: {
        accept: () => {
          mutateDelete({
            resource: "customers",
            id: id,
          });
        },
        reject: () => {},
      },
      t: t,
    });
  }

  const columns = useMemo<ColumnsType<ICustomerResponse>>(
    () => [
      {
        title: "#",
        key: "createdAt",
        dataIndex: "createdAt",
        align: "center",
        width: "1rem",
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("createdAt", sorters),
        render: (value, record, index) =>
          calculateIndex(sorters, current, pageSize, tableProps, index),
      },
      {
        title: t("customers.fields.fullName"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("fullName", sorters),
        dataIndex: "fullName",
        key: "fullName",
        render: (_, { image, fullName }) => (
          <Space>
            <Avatar size={74} src={image} />
            <Text style={{ wordBreak: "inherit" }}>{fullName}</Text>
          </Space>
        ),
      },
      {
        title: t("customers.fields.phone.label"),
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        render: (_, record) => {
          const defaultAddress = record.addressList.find(
            (address) => address.isDefault
          );
          const phoneNumber = defaultAddress
            ? defaultAddress.phoneNumber
            : "N/A";
          return <>{phoneNumber}</>;
        },
      },
      {
        title: t("customers.fields.email"),
        dataIndex: "email",
        key: "email",
      },
      {
        title: t("customers.fields.dateOfBirth"),
        sorter: {},
        defaultSortOrder: getDefaultSortOrder("dateOfBirth", sorters),
        dataIndex: "dateOfBirth",
        key: "dateOfBirth",
        render: (value) => {
          return <>{formatTimestamp(value).dateFormat}</>;
        },
      },
      {
        title: t("customers.fields.address"),
        dataIndex: "address",
        key: "address",
        width: "15%",
        render: (_, record) => {
          const defaultAddress = record.addressList.find(
            (address) => address.isDefault
          );
          const fullAddress = defaultAddress
            ? `${defaultAddress.more}, ${defaultAddress.wardName}, ${defaultAddress.districtName}, ${defaultAddress.provinceName}`
            : "N/A";
          return <>{fullAddress}</>;
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
            record={record}
            onDeleteClick={() => handleDelete(record.id)}
            customButtons={[
              <Tooltip title={t("actions.showAddress")}>
                <Button
                  style={{ color: "#000000", borderColor: "#000000" }}
                  size="small"
                  icon={<IdcardOutlined />}
                  onClick={() => {
                    showAddressModal(record);
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

  return (
    <List>
      <Row gutter={[8, 12]}>
        <Col span={24}>
          <Card>
            <CommonSearchForm
              title={t(`customers.filters.title`)}
              formProps={searchFormProps}
              fields={[
                {
                  label: "",
                  name: "q",
                  type: "input",
                  placeholder: t(`customers.filters.search.placeholder`),
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
                  name: "dateRange",
                  type: "range",
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
      {selectedCustomer && (
        <AddressModal
          customer={selectedCustomer}
          open={openAddressModal}
          handleCancel={handleCancel}
          handleOk={handleOk}
        />
      )}
    </List>
  );
};
