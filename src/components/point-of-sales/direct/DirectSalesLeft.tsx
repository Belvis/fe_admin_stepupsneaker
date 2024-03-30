import React, { useContext } from "react";
import {
  Col,
  Space,
  Card,
  Row,
  Typography,
  theme,
  message,
  Spin,
  App,
} from "antd";
import ShoppingCartHeader from "../ShoppingCartHeader";
import { ColSpanType, IOrderResponse } from "../../../interfaces";
import { OrderItem } from "../OrderItem";
import { debounce } from "lodash";
import { useTranslate, useUpdate } from "@refinedev/core";
import { NumberField } from "@refinedev/antd";
import { POSContext } from "../../../contexts/point-of-sales";
import { directSalesLeftStyle, shoppingCartContainerStyle } from "../style";
import useOrderCalculations from "../../../hooks/useOrderCalculations";

const { Text } = Typography;
const { useToken } = theme;

type DirectSalesLeftProps = {
  order: IOrderResponse;
  span?: ColSpanType | undefined;
};

const DirectSalesLeft: React.FC<DirectSalesLeftProps> = ({
  order,
  span = 14,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const { mutate, isLoading } = useUpdate();
  const { message } = App.useApp();
  const { refetchOrder } = useContext(POSContext);

  const orderDetails = order?.orderDetails || [];
  const { totalQuantity, totalPrice } = useOrderCalculations(orderDetails);

  function editOrderNote(value: string): void {
    if (value !== order.note)
      mutate(
        {
          resource: "orders/apply-note",
          values: {
            note: value,
          },
          id: order.id,
          successNotification: () => {
            return false;
          },
          errorNotification: () => {
            return false;
          },
        },
        {
          onError: (error, variables, context) => {
            message.error(t("orders.notification.note.edit.error"));
          },
          onSuccess: (data, variables, context) => {
            refetchOrder();
            message.success(t("orders.notification.note.edit.success"));
          },
        }
      );
  }

  return (
    <Col span={span} style={directSalesLeftStyle}>
      <Space direction="vertical" style={shoppingCartContainerStyle}>
        <ShoppingCartHeader />
        {orderDetails.map((orderItem, index) => (
          <OrderItem key={orderItem.id} orderDetail={orderItem} count={index} />
        ))}
      </Space>
      <Card style={{ background: token.colorPrimaryBg }}>
        <Spin spinning={isLoading}>
          <Row gutter={[16, 24]} className="h-100">
            <Col span={14}>
              <Space>
                <Text
                  editable={{
                    onChange: debounce(editOrderNote, 300),
                    text: order?.note,
                  }}
                >
                  {order?.note || t("orders.fields.note")}
                </Text>
              </Space>
            </Col>
            <Col span={5}>
              <Space>
                <Text>{t("orders.fields.totalPrice")}</Text>
                <Text>x{totalQuantity}</Text>
              </Space>
            </Col>
            <Col span={5} className="text-end">
              <Text>
                <NumberField
                  options={{
                    currency: "VND",
                    style: "currency",
                  }}
                  value={totalPrice}
                  locale={"vi"}
                />
              </Text>
            </Col>
          </Row>
        </Spin>
      </Card>
    </Col>
  );
};

export default DirectSalesLeft;
