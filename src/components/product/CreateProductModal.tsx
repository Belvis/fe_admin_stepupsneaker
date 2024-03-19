import { useTranslate } from "@refinedev/core";
import {
  Col,
  Form,
  FormProps,
  Grid,
  Input,
  Modal,
  ModalProps,
  Row,
  Typography,
} from "antd";
import {
  LENGTH_CODE,
  LENGTH_DESCRIPTION,
  LENGTH_NAME,
} from "../../constants/common";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { validateCommon } from "../../helpers/validate";
import { IProductResponse } from "../../interfaces";
import { FieldLabel } from "../form/FieldLabel";
import ImageUpload from "../form/ImageUpload";
const { TextArea } = Input;

type CreateProductModalProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const modalWidth = breakpoint.sm ? "500px" : "100%";

  const onFinishHandler = (values: IProductResponse) => {
    const submitData = {
      ...values,
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
      key="create-product-modal"
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col span={8}>
            <ImageUpload formProps={formProps} />
          </Col>
          <Col span={16}>
            <Form.Item
              label={
                <FieldLabel
                  fieldName={t("products.fields.code")}
                  maxLength={LENGTH_CODE}
                  t={t}
                />
              }
              required
              name="code"
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "code"),
                },
              ]}
            >
              <Input maxLength={LENGTH_CODE} showCount />
            </Form.Item>
            <Form.Item
              label={
                <FieldLabel
                  fieldName={t("products.fields.name")}
                  maxLength={LENGTH_NAME}
                  t={t}
                />
              }
              name="name"
              required
              rules={[
                {
                  validator: (_, value) => validateCommon(_, value, t, "name"),
                },
              ]}
            >
              <Input maxLength={LENGTH_NAME} showCount />
            </Form.Item>
            <Form.Item
              label={
                <FieldLabel
                  fieldName={t("products.fields.description")}
                  maxLength={LENGTH_DESCRIPTION}
                  t={t}
                />
              }
              name="description"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "description"),
                },
              ]}
            >
              <TextArea rows={3} maxLength={LENGTH_DESCRIPTION} showCount />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
