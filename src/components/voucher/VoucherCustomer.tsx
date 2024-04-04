import { getDefaultSortOrder, useTable } from "@refinedev/antd";
import { CrudFilters, HttpError, useCreate, useDelete, useParsed, useTranslate } from "@refinedev/core";
import { Avatar, Button, Flex, Space, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useState } from "react";
import { getCustomerStatusOptions } from "../../constants/status";
import { tablePaginationSettings } from "../../constants/tablePaginationConfig";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { formatTimestamp } from "../../helpers/timestamp";
import { ICustomerFilterVariables, ICustomerResponse } from "../../interfaces";
import { calculateIndex } from "../../utils/common/calculator";
import CommonSearchForm from "../form/CommonSearchForm";

const { Title, Text } = Typography;

type VoucherCustomerProps = {
  type: "ineligible" | "eligible";
  shouldRefetch: boolean;
  setShouldRefetch: Dispatch<SetStateAction<boolean>>;
};

const VoucherCustomer: React.FC<VoucherCustomerProps> = ({ type, shouldRefetch, setShouldRefetch }) => {
  const t = useTranslate();
  const { id } = useParsed();

  const { mutate: mutateCreate } = useCreate();
  const { mutate: mutateDelete } = useDelete();

  const {
    tableProps,
    searchFormProps,
    sorters,
    current,
    pageSize,
    tableQueryResult: { refetch },
  } = useTable<ICustomerResponse, HttpError, ICustomerFilterVariables>({
    resource: "customers",
    pagination: {
      pageSize: 5,
    },
    filters: {
      permanent: [
        {
          field: type === "eligible" ? "voucher" : "noVoucher",
          operator: "eq",
          value: id,
        },
      ],
    },
    syncWithLocation: false,
    onSearch: ({ q, status }) => {
      const customerFilters: CrudFilters = [];
      customerFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });

      customerFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q : undefined,
      });

      return customerFilters;
    },
  });

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch]);

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
        render: (value, record, index) => calculateIndex(sorters, current, pageSize, tableProps, index),
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
          const defaultAddress = record.addressList.find((address) => address.isDefault);
          const phoneNumber = defaultAddress ? defaultAddress.phoneNumber : "N/A";
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
    ],
    [t, sorters, current, pageSize, tableProps]
  );

  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedIds(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const hasSelected = selectedIds.length > 0;

  function handleCreate() {
    try {
      mutateCreate(
        {
          resource: "customerVoucher",
          values: {
            voucher: id,
            customers: selectedIds,
          },
          successNotification: (data, values, resource) => {
            return {
              message: t("common.update.success"),
              description: t("common.success"),
              type: "success",
            };
          },
          errorNotification(error) {
            return {
              message: t("common.error") + error?.message,
              description: "Oops!..",
              type: "success",
            };
          },
        },
        {
          onSuccess: () => {
            refetch();
            setShouldRefetch(true);
            setSelectedIds([]);
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
  }

  function handleDelete() {
    if (id) {
      try {
        mutateDelete(
          {
            resource: "customerVoucher",
            values: {
              customers: selectedIds,
            },
            successNotification: (data, values, resource) => {
              return {
                message: t("common.update.success"),
                description: t("common.success"),
                type: "success",
              };
            },
            errorNotification(error) {
              return {
                message: t("common.error") + error?.message,
                description: "Oops!..",
                type: "success",
              };
            },

            id: id,
          },
          {
            onSuccess: () => {
              refetch();
              setShouldRefetch(true);
              setSelectedIds([]);
            },
          }
        );
      } catch (error) {
        console.error("Deletion failed", error);
      }
    }
  }

  const handleButtonClick = () => {
    showWarningConfirmDialog({
      options: {
        accept: () => (type === "eligible" ? handleDelete() : handleCreate()),
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Fragment>
      <CommonSearchForm
        title={t("customers.filters.title")}
        formProps={searchFormProps}
        fields={[
          {
            label: "",
            name: "q",
            type: "input",
            placeholder: t(`customers.filters.search.placeholder`),
            width: "200px",
          },
          {
            label: t(`customers.fields.status`),
            name: "status",
            placeholder: t(`customers.filters.status.placeholder`),
            type: "select",
            options: getCustomerStatusOptions(t),
            width: "200px",
          },
        ]}
        columnRatio={[3, 16, 5]}
      />
      <Table
        className="mt-3"
        rowSelection={rowSelection}
        bordered
        {...tableProps}
        title={() => {
          return (
            <Flex justify={"space-between"} align={"center"}>
              <Title level={5}>
                {t(`vouchers.table.title.${type}`)} ({tableProps.dataSource?.length})
              </Title>
              {hasSelected && (
                <Space>
                  <Button type="primary" loading={tableProps.loading} onClick={handleButtonClick}>
                    {t(`actions.${type === "eligible" ? "remove" : "apply"}`)}
                  </Button>
                  <span style={{ marginLeft: 8 }}>{t("common.rowSelection", { count: selectedIds.length })}</span>
                </Space>
              )}
            </Flex>
          );
        }}
        pagination={{
          ...tableProps.pagination,
          ...tablePaginationSettings,
        }}
        rowKey="id"
        columns={columns}
      />
    </Fragment>
  );
};

export default VoucherCustomer;
