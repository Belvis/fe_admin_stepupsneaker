import { useTranslate } from "@refinedev/core";
import {
  ColorPicker,
  Form,
  FormProps,
  Grid,
  Input,
  Modal,
  ModalProps,
  Select,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { FieldLabel } from "../../../components/form/FieldLabel";
import { getProductStatusOptions } from "../../../constants/status";
import { showWarningConfirmDialog } from "../../../helpers/confirm";
import { validateCommon } from "../../../helpers/validate";
import { colorPickerStyles } from "./style";
import { IColorResponse } from "../../../interfaces";
import { LENGTH_NAME } from "../../../constants/common";

type EditColorProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
  close: () => void;
};

export const EditColor: React.FC<EditColorProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const modalWidth = breakpoint.sm ? "500px" : "100%";

  const handleChange = (newColor: Color) => {
    const hexColor = newColor.toHex();

    if (formProps && formProps.form) {
      formProps.form.setFieldValue("code", hexColor);
    }
  };

  const onFinishHandler = (values: IColorResponse) => {
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
          label={t("colors.fields.code")}
          name="code"
          required
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "code"),
            },
          ]}
        >
          <ColorPicker
            onChange={handleChange}
            showText
            style={colorPickerStyles}
          />
        </Form.Item>
        <Form.Item
          label={
            <FieldLabel
              fieldName={t(`colors.fields.name`)}
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
          label={t("colors.fields.status")}
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
