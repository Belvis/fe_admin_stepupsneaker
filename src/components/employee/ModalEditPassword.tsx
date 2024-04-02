import { useTranslate, useUpdate } from "@refinedev/core";
import { Form, Grid, Modal } from "antd";
import { IEmployeeResponse } from "../../interfaces";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { Input } from "antd";
import React, { useEffect } from "react";
type ChangePasswordProps = {
  openChangePasswordModal: boolean;
  handleCancel: () => void;
  employee: IEmployeeResponse;
};

type ChangePasswordType = {
  newPassword: string;
  enterThePassword: string;
};
export const ChangePassword: React.FC<ChangePasswordProps> = ({
  openChangePasswordModal,
  handleCancel,
  employee,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [form] = Form.useForm<ChangePasswordType>();
  const { mutate: update, isLoading: isLoadingUpdate } = useUpdate();

  const onFinishHandler = (values: ChangePasswordType) => {
    console.log(values);
    showWarningConfirmDialog({
      options: {
        accept: () => {
          const updatedValues = {
            ...values,
            newPassword: values.newPassword,
            enterThePassword: values.enterThePassword,
          };
          update(
            {
              id: employee.id,
              resource: "employees/change-password",
              values: updatedValues,
              successNotification: () => {
                return {
                  message: t("employees.messages.successChangePassword"),
                  description: t("employees.messages.titleSuccess"),
                  type: "success",
                };
              },
            },
            {
              onError: (error, variables, context) => {},
              onSuccess: () => {
                handleCancel();
              },
            }
          );
        },
        reject: () => {},
      },
      t: t,
    });
  };
  useEffect(() => {
    if (openChangePasswordModal) {
      form.resetFields();
    }
  }, [openChangePasswordModal]);

  return (
    <Modal
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1002}
      open={openChangePasswordModal}
      onCancel={handleCancel}
      onOk={() => {
        form.submit();
      }}
      title={t("employees.titles.modal.changePassword")}
    >
      <Form
        form={form}
        name="basic"
        onFinish={onFinishHandler}
        layout="vertical"
      >
        <Form.Item<ChangePasswordType>
          label={t("employees.fields.newPassword")}
          name="newPassword"
          rules={[
            {
              required: true,
              message: t("employees.validations.changePassword.newPassword"),
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<ChangePasswordType>
          label={t("employees.fields.enterThePassword")}
          name="enterThePassword"
          dependencies={["newPassword"]}
          rules={[
            {
              required: true,
              message: t(
                "employees.validations.changePassword.enterThePassword"
              ),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    t(
                      "employees.validations.changePassword.enterThePasswordFail"
                    )
                  )
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};
