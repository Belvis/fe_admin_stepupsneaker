import { DeleteOutlined } from "@ant-design/icons";
import { NumberField } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  Flex,
  Grid,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  theme,
} from "antd";
import { debounce } from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import {
  IOrderResponse,
  IPaymentMethodResponse,
  IPaymentResponse,
} from "../../interfaces";
import { POSContext } from "../../contexts/point-of-sales";
import useOrderCalculations from "../../hooks/useOrderCalculations";
import { DEFAULT_BANK_ACCOUNT } from "../../constants/common";

type PaymentModalProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  order: IOrderResponse;
};

const { Text, Title } = Typography;
const { useToken } = theme;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  handleOk,
  handleCancel,
  order,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const breakpoint = Grid.useBreakpoint();

  const { paymentMethods, payments, setPayments } = useContext(POSContext);

  const orderDetails = order.orderDetails ?? [];

  const { totalPrice } = useOrderCalculations(orderDetails);

  const [thisPayments, setThisPayments] = useState<
    IPaymentResponse[] | undefined
  >();

  useEffect(() => {
    setThisPayments(payments);
  }, [payments]);

  useEffect(() => {
    if (thisPayments) {
      const calculatedTotalMoney = thisPayments.reduce(
        (accumulator, payment) => {
          return accumulator + payment.totalMoney;
        },
        0
      );
      const newMoneyValue =
        totalPrice - calculatedTotalMoney >= 0
          ? totalPrice - calculatedTotalMoney
          : 0;

      setThisCustomerPaid(calculatedTotalMoney);
      setMoney(newMoneyValue);
    }
  }, [thisPayments]);

  const inputRef = useRef<any>(null);
  const [money, setMoney] = useState(0);
  const [customerPaid, setThisCustomerPaid] = useState<number>(0);

  const renderCashMethod = () => (
    <Row
      gutter={10}
      style={{
        background: "#f5f5f5",
        padding: "10px",
        borderRadius: "0.5rem",
      }}
    >
      {renderButtons(totalPrice, setMoney)}
    </Row>
  );

  const handleFinish = () => {
    setPayments(thisPayments);
    handleOk();
  };

  const onCancel = () => {
    setThisCustomerPaid(0);
    setMoney(0);
    setThisPayments(payments);
    handleCancel();
  };

  const handleMoneyChange = debounce((value: number) => {
    setMoney(value);
  }, 500);

  const handleDeletePayment = (paymentMethodId: string) => {
    if (thisPayments) {
      const updatedPayments = thisPayments.filter((payment) => {
        return payment.paymentMethod.id !== paymentMethodId;
      });
      setThisPayments(updatedPayments);
    }
  };

  const handleAddPayment = (method: IPaymentMethodResponse) => {
    if (money === 0) {
      inputRef.current!.focus({
        cursor: "all",
      });
    } else {
      if (!thisPayments) return;
      const existingPaymentIndex = thisPayments.findIndex(
        (payment) => payment.paymentMethod.id === method.id
      );

      if (existingPaymentIndex !== -1) {
        const updatedPayments = [...thisPayments];
        updatedPayments[existingPaymentIndex].totalMoney += money;
        setThisPayments(updatedPayments);
      } else {
        setThisPayments((prev: any) => [
          ...prev,
          {
            order: order,
            paymentMethod: method,
            totalMoney: money,
            transactionCode: "",
          },
        ]);
      }

      const newMoneyValue = totalPrice - money >= 0 ? totalPrice - money : 0;
      setMoney(newMoneyValue);
    }
  };

  return (
    <Modal
      title={t("payments.titles.multiple")}
      width={breakpoint.sm ? "700px" : "100%"}
      zIndex={1001}
      onOk={handleFinish}
      onCancel={onCancel}
      open={open}
    >
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("payments.fields.money")}</Text>
            </Space>
            <InputNumber
              ref={inputRef}
              formatter={(value) =>
                `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: string | undefined) => {
                const parsedValue = parseInt(
                  value!.replace(/₫\s?|(,*)/g, ""),
                  10
                );
                return isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
              }}
              value={money}
              onChange={(value) => handleMoneyChange(value as number)}
              style={{
                width: "30%",
                borderBottom: `1px solid ${token.colorPrimary}`,
                borderRadius: "0",
              }}
              variant="borderless"
            />
          </Flex>
        </Col>
        <Col span={24}>{renderCashMethod()}</Col>
        <Col span={24}>
          <Row gutter={10}>
            {paymentMethods && paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <Col span={24 / paymentMethods.length} key={method.id}>
                  <Button
                    size="large"
                    shape="round"
                    style={{ width: "100%", marginBottom: "10px" }}
                    onClick={() => handleAddPayment(method)}
                  >
                    {t(`paymentMethods.options.${method.name}`)}
                  </Button>
                </Col>
              ))
            ) : (
              <Text>{t("paymentMethods.noPaymentMethods")}</Text>
            )}
          </Row>
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("payments.fields.amountDue")}</Text>
            </Space>
            <Title level={4} style={{ color: `${token.colorPrimary}` }}>
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
          {thisPayments && thisPayments.length > 0 ? (
            thisPayments.map((payment) => (
              <Flex
                key={payment.id}
                gap="middle"
                justify="space-between"
                align="center"
                style={{
                  borderTop: `1px dashed ${token.colorPrimary}`,
                  borderBottom: `1px dashed ${token.colorPrimary}`,
                  paddingBottom: "0.5rem",
                  paddingTop: "0.5rem",
                }}
              >
                <Space size="large" wrap>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      handleDeletePayment(payment.paymentMethod.id)
                    }
                  />
                  <Text strong>
                    {t(`paymentMethods.options.${payment.paymentMethod.name}`)}
                  </Text>
                  {payment.paymentMethod.name != "Cash" ? (
                    <Select
                      showSearch
                      optionFilterProp="children"
                      className="w-100"
                      defaultValue={DEFAULT_BANK_ACCOUNT.number}
                      disabled
                      options={[
                        {
                          value: DEFAULT_BANK_ACCOUNT.number,
                          label: `${DEFAULT_BANK_ACCOUNT.bank} - ${DEFAULT_BANK_ACCOUNT.number} - ${DEFAULT_BANK_ACCOUNT.holder}`,
                        },
                      ]}
                    />
                  ) : null}
                </Space>
                <Text>
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={payment.totalMoney}
                    locale={"vi"}
                  />
                </Text>
              </Flex>
            ))
          ) : (
            <Text>Chưa có thanh toán nào</Text>
          )}
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("payments.fields.customerPay")}</Text>
            </Space>
            <Title level={4}>
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                value={customerPaid}
                locale={"vi"}
              />
            </Title>
          </Flex>
        </Col>
      </Row>
    </Modal>
  );
};

const suggestedMoney = [0, 100000, 200000, 300000];

export const renderButtons = (totalPrice: number, onClick: any) =>
  suggestedMoney.map((money, index) => {
    const totalMoney = totalPrice + money;
    return (
      <Col span={24 / suggestedMoney.length}>
        <Button
          size="large"
          shape="round"
          key={index}
          onClick={() => onClick(totalMoney)}
          style={{ width: "100%" }}
        >
          {totalMoney.toLocaleString()}
        </Button>
      </Col>
    );
  });
