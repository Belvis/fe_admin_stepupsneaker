import { EditOutlined } from "@ant-design/icons";
import { useApiUrl, useCustomMutation, useTranslate } from "@refinedev/core";
import { List as AntdList, Button, Space, Tag, Tooltip } from "antd";
import _ from "lodash";
import React from "react";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import {
  IAddressResponse,
  ICustomerResponse,
  IOrderResponse,
} from "../../interfaces";

type AddressItemProps = {
  item: IAddressResponse;
  customer: ICustomerResponse;
  editModalShow: (id: string) => void;
  callBack: () => void;
  setViewAddress?: (order: IOrderResponse) => void;
  order?: IOrderResponse;
};

const AddressItem: React.FC<AddressItemProps> = ({
  item,
  editModalShow,
  setViewAddress,
  order,
  customer,
  callBack,
}) => {
  const t = useTranslate();
  const { mutate } = useCustomMutation<IAddressResponse>();
  const api = useApiUrl();
  const {
    id,
    provinceName,
    districtName,
    wardName,
    more,
    phoneNumber,
    isDefault,
    provinceId,
    districtId,
    wardCode,
  } = item;
  const defaultTag = isDefault ? (
    <Tag color="green">{t("customers.defaultAddress")}</Tag>
  ) : null;

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

  return (
    <AntdList.Item
      actions={[
        <Space size="small" key={id}>
          <Tooltip title={t("actions.edit")}>
            <Button
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                editModalShow(id);
              }}
            />
          </Tooltip>
          <Button
            disabled={isDefault}
            size="small"
            onClick={() => {
              handleAddressSetDefault(id);
            }}
          >
            {t("actions.setDefault")}
          </Button>

          {setViewAddress && order && (
            <Button
              size="small"
              onClick={() => {
                const newOrder = _.cloneDeep({
                  ...order,
                  phoneNumber: phoneNumber,
                  address: {
                    ...order.address,
                    phoneNumber: phoneNumber,
                    provinceName: provinceName,
                    districtName: districtName,
                    wardName: wardName,
                    provinceId: provinceId,
                    districtId: districtId,
                    wardCode: wardCode,
                    more: more,
                  },
                });
                setViewAddress(newOrder);
                callBack();
              }}
            >
              Chọn
            </Button>
          )}
        </Space>,
      ]}
    >
      <AntdList.Item.Meta
        title={
          <>
            {customer?.fullName} | {phoneNumber} {defaultTag}
          </>
        }
        description={`${more}, ${wardName}, ${districtName}, ${provinceName}`}
      />
    </AntdList.Item>
  );
};

export default AddressItem;
