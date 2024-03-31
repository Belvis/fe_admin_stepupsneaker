import { useTranslate, useUpdate } from "@refinedev/core";
import { Input, Modal, ModalProps, Space, Typography } from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import { IOrderResponse, OrderStatus } from "../../interfaces";
import { showWarningConfirmDialog } from "../../helpers/confirm";

interface ReasonModalProps {
  restModalProps: ModalProps;
  order: IOrderResponse;
  status: OrderStatus;
  callBack: any;
  close: () => void;
}

const { Title } = Typography;

const ReasonModal: React.FC<ReasonModalProps> = ({
  restModalProps,
  order,
  status,
  callBack,
  close,
}) => {
  const t = useTranslate();

  const { mutate: update, isLoading: isLoadingUpdate } = useUpdate();

  const [value, setValue] = useState("");

  useEffect(() => {
    if (restModalProps.open) {
      setValue("");
    }
  }, [restModalProps]);

  const handleOk = () => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          update(
            {
              resource: `orders/confirmation-order`,
              values: {
                status: status,
                orderHistoryNote: value,
              },
              id: order.id,
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
              onError: (error, variables, context) => {},
              onSuccess: (data, variables, context) => {
                callBack();
                close();
                setValue("");
              },
            }
          );
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Modal
      title={
        <Space align="baseline">
          <Title level={5}>Nhập lý do</Title>
        </Space>
      }
      {...restModalProps}
      open={restModalProps.open}
      width="500px"
      centered
      onOk={handleOk}
    >
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { value: inputValue } = e.target;
          setValue(inputValue);
        }}
      />
    </Modal>
  );
};

export default ReasonModal;
