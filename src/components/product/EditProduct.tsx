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
import { FieldLabel } from "../form/FieldLabel";
import ImageUpload from "../form/ImageUpload";
const { TextArea } = Input;
const { Text } = Typography;

type EditProductProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
};

export const EditProduct: React.FC<EditProductProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

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
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
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
              label={
                <FieldLabel
                  fieldName={t("products.fields.description")}
                  maxLength={LENGTH_DESCRIPTION}
                  t={t}
                />
              }
              required
              name="description"
              rules={[
                {
                  validator: (_, value) =>
                    validateCommon(_, value, t, "description"),
                },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="..."
                maxLength={LENGTH_DESCRIPTION}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
