import { useResource, useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps, Select } from "antd";
import { getProductStatusOptions } from "../../constants/status";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { validateCommon } from "../../helpers/validate";
import { IProdAttributeResponse } from "../../interfaces";
import { FieldLabel } from "../form/FieldLabel";
import { LENGTH_NAME } from "../../constants/common";

type EditProdAttributeProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const EditProdAttribute: React.FC<EditProdAttributeProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const modalWidth = breakpoint.sm ? "500px" : "100%";
  const { resource } = useResource();

  const onFinishHandler = (values: IProdAttributeResponse) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(values);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Modal
      {...modalProps}
      width={modalWidth}
      zIndex={1001}
      key={`edit-${resource?.name}-modal`}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Form.Item
          label={
            <FieldLabel
              fieldName={t(`${resource?.name}.fields.name`)}
              maxLength={LENGTH_NAME}
              t={t}
            />
          }
          required
          name="name"
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "name"),
            },
          ]}
        >
          <Input maxLength={LENGTH_NAME} showCount />
        </Form.Item>
        <Form.Item
          label={t(`${resource?.name}.fields.status`)}
          name="status"
          required
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "status"),
            },
          ]}
        >
          <Select options={getProductStatusOptions(t)} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
