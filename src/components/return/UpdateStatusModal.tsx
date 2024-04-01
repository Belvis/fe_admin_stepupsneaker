import { useTranslate, useUpdate } from "@refinedev/core";
import { Input, Modal, ModalProps, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { DeliveryStatus, IReturnFormResponse } from "../../interfaces";

interface UpdateStatusModalProps {
  restModalProps: ModalProps;
  returnForm: IReturnFormResponse;
  status: DeliveryStatus;
  callBack: any;
  close: () => void;
}

const { Title } = Typography;

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  restModalProps,
  returnForm,
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
              resource: `return-forms/update-return-delivery-status`,
              values: {
                status: status,
                note: value,
              },
              id: returnForm.id,
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
                  type: "error",
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

export default UpdateStatusModal;
