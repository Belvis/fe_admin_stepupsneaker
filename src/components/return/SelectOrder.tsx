import { useModal } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useApiUrl,
  useTranslate,
} from "@refinedev/core";
import { App, Button, Col, Form, Image, Input, Row } from "antd";

import { QrcodeOutlined, SearchOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { ReturnFormContext } from "../../contexts/return";
import { IOrderResponse } from "../../interfaces";
import { dataProvider } from "../../providers/dataProvider";
import { QRScannerModal } from "../qr-scanner/QRScannerModal";
import { validateCommon } from "../../helpers/validate";

export const SelectOrder: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();
  const { getOne } = dataProvider(API_URL);
  const { notification } = App.useApp();

  const { next, setSelectedOrder } = useContext(ReturnFormContext);

  const {
    show: scanShow,
    close: scanClose,
    modalProps: scanModalProps,
  } = useModal();

  const handleScanSuccess = async (result: string) => {
    try {
      const { data } = await getOne({
        resource: "orders/tracking",
        id: result,
      });
      if (data) {
        setSelectedOrder(data as IOrderResponse);
        next();
      }
    } catch (error: any) {
      notification.error({
        message: t("common.error") + error?.message,
        description: "Oops!..",
      });
    }
  };

  const [form] = Form.useForm<{
    orderCode: string;
  }>();

  const handleSubmit = async (values: { orderCode: string }) => {
    try {
      const orderCode = values.orderCode;
      const { data } = await getOne({
        resource: "orders/tracking",
        id: orderCode,
      });

      if (data) {
        setSelectedOrder(data as IOrderResponse);
        next();
      }
    } catch (error: any) {
      notification.error({
        message: t("common.error") + error?.message,
        description: "Oops!..",
      });
    }
  };

  return (
    <Row gutter={[8, 12]}>
      <Col span={24} className="mt-3">
        <Form
          form={form}
          onFinish={(values) => handleSubmit(values)}
          layout="inline"
          className="justify-content-center"
        >
          <Form.Item
            key="orderCode"
            name="orderCode"
            label={t("return-form-details.fields.orderCode")}
            required
            rules={[
              {
                validator: (_, value) =>
                  validateCommon(_, value, t, "orderCode"),
              },
            ]}
          >
            <Input prefix={<SearchOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button icon={<SearchOutlined />} htmlType="submit">
              {t("buttons.search")}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              icon={<QrcodeOutlined />}
              type="default"
              onClick={() => {
                scanShow();
              }}
            >
              {t("buttons.scanQR")}
            </Button>
          </Form.Item>
        </Form>
      </Col>

      <Col span={24} className="d-flex justify-content-center">
        <Image width="40%" src="/images/return-order.jpg" preview={false} />
      </Col>

      {scanModalProps.open && (
        <QRScannerModal
          modalProps={scanModalProps}
          close={scanClose}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </Row>
  );
};
