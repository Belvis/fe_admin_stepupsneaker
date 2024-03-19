import { HttpError, useOne, useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps } from "antd";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { FieldLabel } from "../../components/form/FieldLabel";
import { validateCommon } from "../../helpers/validate";
import { LENGTH_NAME } from "../../constants/common";

type EditRoleProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const EditRole: React.FC<EditRoleProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const modalWidth = breakpoint.sm ? "500px" : "100%";

  const onFinishHandler = (values: any) => {
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
    <Modal {...modalProps} width={modalWidth} zIndex={1001}>
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Form.Item
          label={
            <FieldLabel
              fieldName={t(`roles.fields.name`)}
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
      </Form>
    </Modal>
  );
};
