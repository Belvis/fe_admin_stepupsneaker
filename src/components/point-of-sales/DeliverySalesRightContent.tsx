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
import {
  IOrderResponse,
  IPaymentMethodResponse,
  IPaymentResponse,
} from "../../interfaces";
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
    isCOD,
    setPaymentMethods,
    setPayments,
    setIsCOD,
  } = useContext(DeliverySalesContext);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const orderDetails = order?.orderDetails || [];
  const initialPrice = orderDetails.length > 0 ? orderDetails[0].price : 0;
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);

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
    const defaultPayment = {
      id: "",
      order: order,
      paymentMethod: paymentMethods?.[0] ?? ({} as IPaymentMethodResponse),
      totalMoney: totalPrice,
      description: "",
      createdAt: 0,
      updatedAt: 0,
    };

    const newPayment: IPaymentResponse = {
      ...defaultPayment,
      transactionCode: isCOD ? "" : "CASH",
      paymentStatus: isCOD ? "PENDING" : "COMPLETED",
    };

    setPayments([newPayment]);
  }, [isCOD]);

  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      setPaymentMethods(data.data);
      setPayments([
        {
          id: "",
          order: order,
          paymentMethod: data.data[0],
          transactionCode: "",
          paymentStatus: "COMPLETED",
          totalMoney: totalPrice,
          description: "",
          createdAt: 0,
          updatedAt: 0,
        },
      ]);
    }
  }, [data]);

  if (order.customer) {
    const defaultAddress = order?.customer.addressList.find(
      (address) => address.isDefault === true
    );

    if (defaultAddress) {
      form.setFieldsValue({
        phoneNumber: defaultAddress.phoneNumber,
        provinceId: Number(defaultAddress.provinceId),
        districtId: Number(defaultAddress.districtId),
        wardCode: defaultAddress.wardCode,
        more: defaultAddress.more,
        fullName: order.customer.fullName,
      });
    }
  }

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleSwitchChange = (checked: boolean) => {
    setIsCOD(checked);
  };

  const calculateTotalPayment = () => {
    if (!payments) return "Loading...";
    const totalPaid = payments
      .filter((payment) => payment.paymentStatus !== "PENDING")
      .reduce((acc, payment) => acc + payment.totalMoney, 0);
    return (
      <NumberField
        options={{
          currency: "VND",
          style: "currency",
        }}
        value={totalPaid}
        locale={"vi"}
      />
    );
  };

  const calculateCODPayment = () => {
    if (!payments) return "Loading...";
    const codPaid = payments
      .filter((payment) => payment.paymentStatus !== "COMPLETED")
      .reduce((acc, payment) => acc + payment.totalMoney, 0);
    return (
      <NumberField
        options={{
          currency: "VND",
          style: "currency",
        }}
        value={codPaid}
        locale={"vi"}
      />
    );
  };

  const calculateChange = () => {
    if (!payments || !payments.length) return "Loading...";

    const totalPaid = payments
      .filter((payment) => payment.paymentStatus !== "PENDING")
      .reduce((acc, payment) => acc + payment.totalMoney, 0);

    const changeAmount = totalPaid - (totalPrice - discount);

    return (
      <NumberField
        options={{
          currency: "VND",
          style: "currency",
        }}
        value={changeAmount}
        locale={"vi"}
      />
    );
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
                  disabled={isCOD}
                  icon={
                    <CreditCardFilled style={{ color: token.colorPrimary }} />
                  }
                  onClick={showModal}
                />
              </Space>
              <Title level={4}>{calculateTotalPayment()}</Title>
            </Flex>
          </Col>
          <Col span={24}>
            <Flex gap="middle" justify="space-between" align="center">
              <Space size="large" wrap>
                <Text strong>{t("orders.tab.cod")}</Text>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  onChange={handleSwitchChange}
                  value={isCOD}
                  size="small"
                />
              </Space>
              <Text strong>{calculateCODPayment()}</Text>
            </Flex>
          </Col>
          <Col span={24}>
            <Flex gap="middle" justify="space-between" align="center">
              <Space size="large" wrap>
                <Text strong>{t("orders.tab.change")}</Text>
              </Space>
              <Text strong>{calculateChange()}</Text>
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
