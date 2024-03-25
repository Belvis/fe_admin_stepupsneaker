import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import { NumberField } from "@refinedev/antd";
import { useTranslate, useUpdate } from "@refinedev/core";
import {
  App,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { debounce } from "lodash";
import { useContext, useState } from "react";
import { POSContext } from "../../contexts/point-of-sales";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";
import { ColSpanType, IOrderResponse } from "../../interfaces";
import { DiscountModal } from "./DiscountModal";
import { OrderItem } from "./OrderItem";
import ShoppingCartHeader from "./ShoppingCartHeader";

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
  const { mutate: mutateUpdate, isLoading } = useUpdate();
  const { message } = App.useApp();

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

  function editOrderShippingMoney(value: string): void {
    const shippingMoney = Number(value);

    if (isNaN(shippingMoney)) {
      message.error(t("orders.notification.shippingMoney.edit.invalid"));
      return;
    }
    if (shippingMoney !== order.shippingMoney)
      mutateUpdate(
        {
          resource: "orders/apply-shipping",
          values: {
            addressShipping: {
              ...order.address,
            },
            shippingMoney: shippingMoney,
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
            message.error(t("orders.notification.shippingMoney.edit.error"));
          },
          onSuccess: (data, variables, context) => {
            refetchOrder();
            message.success(
              t("orders.notification.shippingMoney.edit.success")
            );
          },
        }
      );
  }

  const removeOrderVoucher = () => {
    mutateUpdate(
      {
        resource: "orders/apply-voucher",
        values: {
          voucher: null,
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
          message.error(
            t("orders.notification.voucher.edit.error") + error.message
          );
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          message.success(t("orders.notification.voucher.edit.success"));
        },
      }
    );
  };

  return (
    <Col
      span={span}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Space
        direction="vertical"
        style={{
          overflow: "auto",
          width: "100%",
          maxHeight: "215px",
        }}
      >
        <ShoppingCartHeader />
        {orderDetails.map((orderItem, index) => (
          <OrderItem key={orderItem.id} orderDetail={orderItem} count={index} />
        ))}
      </Space>
      <Card style={{ background: token.colorPrimaryBg }} loading={isLoading}>
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
                  {!order.voucher ? (
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
                  ) : (
                    <Button
                      type="text"
                      size="small"
                      icon={
                        <MinusSquareFilled
                          style={{ color: token.colorPrimary }}
                        />
                      }
                      onClick={removeOrderVoucher}
                    />
                  )}
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
