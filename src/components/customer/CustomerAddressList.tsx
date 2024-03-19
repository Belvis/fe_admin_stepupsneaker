import { CreateButton, List, useModalForm } from "@refinedev/antd";
import { useApiUrl, useCustomMutation, useTranslate } from "@refinedev/core";
import { Button, Flex, Space, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { IAddressResponse, ICustomerResponse } from "../../interfaces";
import { CreateAddress } from "../address/CreateAddress";
import { AddressFormTwo } from "../form/AddressFormTwo";

type CustomerAddressListProps = {
  isLoading: boolean;
  customer: ICustomerResponse;
  callBack: any;
};

export const CustomerAddressList: React.FC<CustomerAddressListProps> = ({
  isLoading,
  customer,
  callBack,
}) => {
  const t = useTranslate();
  const api = useApiUrl();

  const { modalProps, formProps, show, onFinish, close } =
    useModalForm<IAddressResponse>({
      resource: "addresses",
      onMutationSuccess: () => {
        formProps.form?.resetFields();
        callBack();
        close();
      },
      action: "create",
      redirect: false,
      warnWhenUnsavedChanges: false,
    });

  const { mutate } = useCustomMutation<IAddressResponse>();

  function handleAddressSetDefault(id: string) {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          mutate(
            {
              url: `${api}/addresses/set-default-address?address=${id}`,
              method: "put",
              values: {
                address: id,
              },
              successNotification: (data, values) => {
                return {
                  message: t(
                    "addresses.notification.setDefault.success.message"
                  ),
                  description: t(
                    "addresses.notification.setDefault.success.description"
                  ),
                  type: "success",
                };
              },
              errorNotification: (data, values) => {
                return {
                  message: t("addresses.notification.setDefault.error.message"),
                  description: t(
                    "addresses.notification.setDefault.error.description"
                  ),
                  type: "error",
                };
              },
            },
            {
              onSuccess: (data, variables, context) => {
                callBack();
              },
            }
          );
        },
        reject: () => {},
      },
      t: t,
    });
  }

  const columnsAddress: ColumnsType<IAddressResponse> = [
    {
      title: t("customers.fields.address"),
      key: "id",
      render: (_, record) => {
        const fullAddress = record
          ? `${record.more}, ${record.wardName}, ${record.districtName}, ${record.provinceName}`
          : "N/A";
        const defaultTag = record.isDefault ? (
          <Tag color="green">{t("customers.defaultAddress")}</Tag>
        ) : null;

        return (
          <Flex align="middle" justify="space-between">
            <Space>
              {fullAddress} {defaultTag}
            </Space>
            <Space size="small" key={record.id}>
              <Button
                disabled={record.isDefault}
                size="small"
                onClick={() => {
                  handleAddressSetDefault(record.id);
                }}
              >
                {t("actions.setDefault")}
              </Button>
            </Space>
          </Flex>
        );
      },
    },
  ];

  return (
    <List
      title={t("customers.addresses")}
      breadcrumb={null}
      headerProps={{
        extra: (
          <CreateButton
            onClick={() => {
              formProps.form?.resetFields();
              show();
            }}
          />
        ),
        style: {
          marginTop: "1em",
        },
      }}
    >
      <Table
        loading={isLoading}
        pagination={false}
        dataSource={customer?.addressList?.slice().sort((a, b) => {
          return b.isDefault === true ? 1 : -1;
        })}
        rowKey="id"
        columns={columnsAddress}
        expandable={{
          expandedRowRender: (record) => (
            <AddressFormTwo
              callBack={callBack}
              address={record}
              loading={isLoading}
            />
          ),
        }}
      />
      <CreateAddress
        modalProps={modalProps}
        formProps={formProps}
        onFinish={onFinish}
        customer={customer}
      />
    </List>
  );
};
