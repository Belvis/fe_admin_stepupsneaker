import { useResource, useTranslate } from "@refinedev/core";
import { Modal, ModalProps, Form, FormProps, Input, Grid } from "antd";
import {
  IProdAttributeRequest,
  IProdAttributeResponse,
} from "../../interfaces";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { FieldLabel } from "../form/FieldLabel";
import { validateCommon } from "../../helpers/validate";
import { LENGTH_NAME } from "../../constants/common";

type CreateProdAttributeProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: IProdAttributeRequest) => void;
  resourceName?: string;
};

export const CreateProdAttribute: React.FC<CreateProdAttributeProps> = ({
  modalProps,
  formProps,
  onFinish,
  resourceName,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const modalWidth = breakpoint.sm ? "500px" : "100%";
  const { resource } = useResource(resourceName);

  const onFinishHandler = (values: IProdAttributeResponse) => {
    const submitData: IProdAttributeRequest = {
      name: values.name,
      status: "ACTIVE",
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(submitData);
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
      key={`create-${resource?.name}-modal`}
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
            {
              whitespace: true,
            },
          ]}
        >
          <Input maxLength={LENGTH_NAME} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};
