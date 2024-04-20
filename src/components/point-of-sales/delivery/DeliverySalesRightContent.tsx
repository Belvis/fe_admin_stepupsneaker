import {
  CheckOutlined,
  CloseOutlined,
  CreditCardFilled,
} from "@ant-design/icons";
import { NumberField } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
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
import { LENGTH_EMAIL, LENGTH_NAME } from "../../../constants/common";
import { POSContext } from "../../../contexts/point-of-sales";
import { DeliverySalesContext } from "../../../contexts/point-of-sales/delivery-sales";
import { validateEmail, validateFullName } from "../../../helpers/validate";
import useOrderCalculations from "../../../hooks/useOrderCalculations";
import {
  IOrderResponse,
  IPaymentMethodResponse,
  IPaymentResponse,
} from "../../../interfaces";
import {
  calculateChange,
  calculatePayment,
} from "../../../utils/common/calculator";
import { AddressFormFour } from "../../form/AddressFormFour";
import { PaymentModal } from "../PaymentModal";

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

  const { paymentMethods, payments, setPaymentMethods, setPayments } =
    useContext(POSContext);

  const { form, discount, isCOD, setIsCOD } = useContext(DeliverySalesContext);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const orderDetails = order?.orderDetails || [];
  const { totalPrice } = useOrderCalculations(orderDetails);

  const [isCODInitialized, setIsCODInitialized] = useState(false);

  useEffect(() => {
    if (isCODInitialized) {
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
        transactionCode: "",
        paymentStatus: isCOD ? "PENDING" : "COMPLETED",
      };

      setPayments([newPayment]);
    } else {
      setIsCODInitialized(true);
    }
  }, [isCODInitialized, isCOD]);

  useEffect(() => {
    if (paymentMethods && totalPrice > 0) {
      setPayments([
        {
          id: "",
          order: order,
          paymentMethod: paymentMethods[0],
          transactionCode: "",
          paymentStatus: "COMPLETED",
          totalMoney: totalPrice,
          description: "string",
          createdAt: 0,
          updatedAt: 0,
        },
      ]);
    }
  }, [paymentMethods]);

  if (order.customer) {
    const defaultAddress = order?.customer.addressList.find(
      (address) => address.isDefault === true
    );

    if (defaultAddress) {
      form.setFieldsValue({
        phoneNumber: defaultAddress.phoneNumber,
        provinceId: Number(defaultAddress.provinceId),
        provinceName: defaultAddress.provinceName,
        districtId: Number(defaultAddress.districtId),
        districtName: defaultAddress.districtName,
        wardCode: defaultAddress.wardCode,
        wardName: defaultAddress.wardName,
        more: defaultAddress.more,
        fullName: order.customer.fullName,
      });
    }
    form.setFieldValue("email", order.customer.email);
  } else {
    form.resetFields();
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

  const renderTotalPayment = () => {
    let totalPaid;
    if (!payments) {
      totalPaid = 0;
    } else {
      totalPaid = calculatePayment(payments, "PENDING");
    }

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

  const renderCODPayment = () => {
    let codPaid;
    if (!payments) {
      codPaid = 0;
    } else {
      codPaid = calculatePayment(payments, "COMPLETED");
    }

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

  const renderChange = () => {
    let changeAmount;
    const hasPendingPayment = payments?.find(
      (payment) => payment.paymentStatus === "PENDING"
    );

    if (!payments || hasPendingPayment || isCOD) {
      changeAmount = 0;
    } else {
      changeAmount = calculateChange(payments, totalPrice, discount);
    }

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
              <Title level={4}>{renderTotalPayment()}</Title>
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
              <Text strong>{renderCODPayment()}</Text>
            </Flex>
          </Col>
          <Col span={24}>
            <Flex gap="middle" justify="space-between" align="center">
              <Space size="large" wrap>
                <Text strong>{t("orders.tab.change")}</Text>
              </Space>
              <Text strong>{renderChange()}</Text>
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
                    maxLength={LENGTH_NAME}
                    showCount
                    placeholder={
                      t("orders.transportAddress.name") +
                      " " +
                      "(" +
                      t("common.maxLength", { length: LENGTH_NAME }) +
                      ")"
                    }
                    variant="borderless"
                    style={{
                      width: "100%",
                      borderBottom: `1px solid ${token.colorPrimary}`,
                      borderRadius: 0,
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      validator: validateEmail,
                    },
                  ]}
                  className="w-100"
                >
                  <Input
                    maxLength={LENGTH_EMAIL}
                    showCount
                    placeholder={
                      t("orders.transportAddress.email") +
                      " " +
                      "(" +
                      t("common.maxLength", { length: LENGTH_EMAIL }) +
                      ")"
                    }
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
        order={order}
      />
    </Row>
  );
};
