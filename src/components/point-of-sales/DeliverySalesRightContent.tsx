import {
  CheckOutlined,
  CloseOutlined,
  CreditCardFilled,
} from "@ant-design/icons";
import { NumberField } from "@refinedev/antd";
import { HttpError, useList, useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Switch,
  Typography,
  theme,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";
import { validateFullName } from "../../helpers/validate";
import { IOrderResponse, IPaymentMethodResponse } from "../../interfaces";
import { AddressFormFour } from "../form/AddressFormFour";
import { PaymentModal } from "./PaymentModal";

const { useToken } = theme;
const { Text, Title } = Typography;
type DeliverySalesRightContentProps = {
  order: IOrderResponse;
};

export const DeliverySalesRightContent: React.FC<
  DeliverySalesRightContentProps
> = ({ order }) => {
  const t = useTranslate();
  const { token } = useToken();

  const {
    payments,
    form,
    discount,
    paymentMethods,
    setPaymentMethods,
    setPayments,
  } = useContext(DeliverySalesContext);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const orderDetails = order?.orderDetails || [];
  const initialPrice = orderDetails.length > 0 ? orderDetails[0].price : 0;
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);
  const [change, setChange] = useState(initialPrice - totalPrice);

  const { data, isLoading } = useList<IPaymentMethodResponse, HttpError>({
    resource: "payment-methods",
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
  });

  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      setPaymentMethods(data.data);
      setPayments([
        {
          id: "",
          order: order,
          paymentMethod: data.data[0],
          transactionCode: "",
          totalMoney: totalPrice,
          description: "",
          createdAt: 0,
          updatedAt: 0,
        },
      ]);
    }
  }, [data]);

  useEffect(() => {
    if (payments) {
      const customerPaid = payments.reduce(
        (acc, payment) => acc + payment.totalMoney,
        0
      );
      const changeAmount = customerPaid - (totalPrice - discount);
      setChange(changeAmount);
    }
  }, [payments]);

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <Row
      gutter={[16, 24]}
      style={{
        height: "100%",
      }}
    >
      {/* Content */}
      <Col
        span={24}
        style={{
          maxHeight: "208.4px",
          overflow: "auto",
        }}
      >
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Flex gap="middle" justify="space-between" align="center">
              <Space size="large" wrap>
                <Text strong>{t("orders.tab.customerPay")}</Text>
                <Button
                  size="small"
                  type="text"
                  icon={
                    <CreditCardFilled style={{ color: token.colorPrimary }} />
                  }
                  onClick={showModal}
                />
              </Space>
              <Title level={4}>
                {payments ? (
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={payments.reduce(
                      (acc, payment) => acc + payment.totalMoney,
                      0
                    )}
                    locale={"vi"}
                  />
                ) : (
                  "Loading..."
                )}
              </Title>
            </Flex>
          </Col>
          <Col span={24}>
            <Flex gap="middle" justify="space-between" align="center">
              <Space size="large" wrap>
                <Text strong>{t("orders.tab.cod")}</Text>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  size="small"
                />
              </Space>
              <Text strong>
                <NumberField
                  options={{
                    currency: "VND",
                    style: "currency",
                  }}
                  value={0}
                  locale={"vi"}
                />
              </Text>
            </Flex>
          </Col>
          <Col span={24}>
            <Flex gap="middle" justify="space-between" align="center">
              <Space size="large" wrap>
                <Text strong>{t("orders.tab.change")}</Text>
              </Space>
              <Text strong>
                <NumberField
                  options={{
                    currency: "VND",
                    style: "currency",
                  }}
                  value={change}
                  locale={"vi"}
                />
              </Text>
            </Flex>
          </Col>
          <Col span={24} style={{ padding: 0 }}>
            <Form form={form} layout="vertical" autoComplete="off">
              <Col span={24}>
                <Form.Item
                  name="fullName"
                  rules={[
                    {
                      validator: validateFullName,
                    },
                  ]}
                  className="w-100"
                >
                  <Input
                    placeholder="Tên người nhận"
                    variant="borderless"
                    style={{
                      width: "100%",
                      borderBottom: `1px solid ${token.colorPrimary}`,
                      borderRadius: 0,
                    }}
                  />
                </Form.Item>
              </Col>
              <AddressFormFour form={form} />
            </Form>
          </Col>
        </Row>
      </Col>
      <PaymentModal
        open={isModalVisible}
        handleOk={handleModalOk}
        handleCancel={handleModalCancel}
        paymentMethods={paymentMethods}
        payments={payments}
        initialPrice={initialPrice}
        totalPrice={totalPrice}
        setPayments={setPayments}
        order={order}
      />
    </Row>
  );
};
