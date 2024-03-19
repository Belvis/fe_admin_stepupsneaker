import { useTranslate, useUpdate } from "@refinedev/core";
import { ColSpanType, IOrderResponse } from "../../interfaces";
import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import ShoppingCartHeader from "./ShoppingCartHeader";
import { OrderItem } from "./OrderItem";
import { debounce } from "lodash";
import { NumberField } from "@refinedev/antd";
import { PlusSquareFilled } from "@ant-design/icons";
import { DiscountModal } from "./DiscountModal";
import { useContext, useState } from "react";
import { POSContext } from "../../contexts/point-of-sales";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";

const { Text, Title } = Typography;
const { useToken } = theme;

type DeliverySalesLeftProps = {
  order: IOrderResponse;
  span?: ColSpanType | undefined;
};

export const DeliverySalesLeft: React.FC<DeliverySalesLeftProps> = ({
  order,
  span = 12,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const { mutate: mutateUpdate } = useUpdate();
  const [messageApi, contextHolder] = message.useMessage();

  const { refetchOrder } = useContext(POSContext);
  const { shippingMoney, discount } = useContext(DeliverySalesContext);

  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);

  const showDiscountModal = () => {
    setIsDiscountModalVisible(true);
  };

  const handleDiscountModalOk = () => {
    setIsDiscountModalVisible(false);
  };

  const handleDiscountModalCancel = () => {
    setIsDiscountModalVisible(false);
  };

  const orderDetails = order?.orderDetails || [];
  const totalQuantity = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.quantity;
  }, 0);
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);

  function editOrderNote(value: string): void {
    if (value !== order.note)
      mutateUpdate(
        {
          resource: "orders",
          values: {
            ...order,
            customer: order.customer ? order.customer.id : null,
            employee: order.employee ? order.employee.id : null,
            voucher: order.voucher ? order.voucher.id : null,
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
            messageApi.open({
              type: "error",
              content: t("orders.notification.note.edit.error"),
            });
          },
          onSuccess: (data, variables, context) => {
            refetchOrder();
            messageApi.open({
              type: "success",
              content: t("orders.notification.note.edit.success"),
            });
          },
        }
      );
  }

  function editOrderShippingMoney(value: string): void {
    if (value !== order.shippingMoney.toString())
      mutateUpdate(
        {
          resource: "orders",
          values: {
            ...order,
            customer: order.customer ? order.customer.id : null,
            employee: order.employee ? order.employee.id : null,
            voucher: order.voucher ? order.voucher.id : null,
            shippingMoney: value,
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
            messageApi.open({
              type: "error",
              content: t("orders.notification.note.edit.error"),
            });
          },
          onSuccess: (data, variables, context) => {
            refetchOrder();
            messageApi.open({
              type: "success",
              content: t("orders.notification.note.edit.success"),
            });
          },
        }
      );
  }

  return (
    <Col
      span={span}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {contextHolder}
      <Space
        direction="vertical"
        style={{
          overflow: "auto",
          width: "100%",
          maxHeight: "350px",
        }}
      >
        <ShoppingCartHeader />
        {orderDetails.map((orderItem, index) => (
          <OrderItem key={orderItem.id} orderDetail={orderItem} count={index} />
        ))}
      </Space>
      <Card style={{ background: token.colorPrimaryBg }}>
        <Row gutter={[16, 24]} style={{ height: "100%" }}>
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
          <Col span={10}>
            <Col span={24}>
              <Flex gap="middle" justify="space-between" align="center">
                <Space size="large" wrap>
                  <Text>{t("orders.fields.totalPrice")}</Text>
                  <Text>{totalQuantity}</Text>
                </Space>
                <Title level={5}>
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={totalPrice}
                    locale={"vi"}
                  />
                </Title>
              </Flex>
            </Col>
            <Col span={24}>
              <Flex gap="middle" justify="space-between" align="center">
                <Space size="large" wrap>
                  <Text>{t("orders.tab.discount")}</Text>
                  <Tooltip
                    title={
                      !order.customer
                        ? t("orders.validation.discount.retailCustomer")
                        : ""
                    }
                  >
                    <Button
                      disabled={!order.customer}
                      type="text"
                      size="small"
                      icon={
                        <PlusSquareFilled
                          style={{ color: token.colorPrimary }}
                        />
                      }
                      onClick={showDiscountModal}
                    />
                  </Tooltip>
                </Space>
                <Title level={5}>
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={discount}
                    locale={"vi"}
                  />
                </Title>
              </Flex>
            </Col>
            <Col span={24}>
              <Flex gap="middle" justify="space-between" align="center">
                <Space size="large" wrap>
                  <Text>{t("orders.tab.shippingMoney")}</Text>
                </Space>
                <Title
                  level={5}
                  style={{ color: `${token.colorPrimary}` }}
                  editable={{
                    onChange: debounce(editOrderShippingMoney, 300),
                    text: shippingMoney + "",
                  }}
                >
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={shippingMoney}
                    locale={"vi"}
                  />
                </Title>
              </Flex>
            </Col>
            <Col span={24}>
              <Flex gap="middle" justify="space-between" align="center">
                <Space size="large" wrap>
                  <Text strong>{t("orders.tab.amountDue")}</Text>
                </Space>
                <Title level={5} style={{ color: `${token.colorPrimary}` }}>
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={totalPrice - discount + shippingMoney}
                    locale={"vi"}
                  />
                </Title>
              </Flex>
            </Col>
          </Col>
        </Row>
      </Card>
      <DiscountModal
        open={isDiscountModalVisible}
        handleOk={handleDiscountModalOk}
        handleCancel={handleDiscountModalCancel}
        customer={order.customer}
        order={order}
      />
    </Col>
  );
};
