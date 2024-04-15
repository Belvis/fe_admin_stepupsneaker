import {
  CheckCircleOutlined,
  CloseOutlined,
  CreditCardFilled,
  MinusSquareFilled,
  PlusSquareFilled,
} from "@ant-design/icons";
import { NumberField, useModal } from "@refinedev/antd";
import { useNavigation, useTranslate, useUpdate } from "@refinedev/core";
import {
  App,
  Button,
  Col,
  Divider,
  Drawer,
  Flex,
  Grid,
  Input,
  QRCode,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { useContext, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useReactToPrint } from "react-to-print";
import {
  DEFAULT_BANK_ACCOUNT,
  QRCODE_ICON_URL,
  QRCODE_VALUE,
} from "../../../constants/common";
import { POSContext } from "../../../contexts/point-of-sales";
import { DirectSalesContext } from "../../../contexts/point-of-sales/direct-sales";
import { paymentToRequest } from "../../../helpers/mapper";
import { formatTimestamp } from "../../../helpers/timestamp";
import useOrderCalculations from "../../../hooks/useOrderCalculations";
import {
  IOrderResponse,
  IPaymentRequest,
  IPaymentResponse,
} from "../../../interfaces";
import { InvoiceTemplate } from "../../../template/InvoiceTemplate";
import {
  calculateChange,
  calculatePayment,
} from "../../../utils/common/calculator";
import { DiscountModal } from "../DiscountModal";
import EmployeeSection from "../EmployeeInputSection";
import { PaymentComfirmModal } from "../PaymentConfirmModal";
import { PaymentModal, renderButtons } from "../PaymentModal";
import VoucherMessage from "../VoucherMessage";

const { Text, Title } = Typography;
const { useToken } = theme;

type CheckOutDrawerProps = {
  open: boolean;
  onClose: () => void;
  order: IOrderResponse;
};

export const CheckOutDrawer: React.FC<CheckOutDrawerProps> = ({
  open,
  onClose,
  order,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const { mutate: mutateUpdate, isLoading: isLoadingOrderUpdate } = useUpdate();
  const { list } = useNavigation();
  const { message } = App.useApp();
  const breakpoint = Grid.useBreakpoint();

  const {
    refetchOrder,
    paymentMethods,
    payments,
    setPayments,
    refetchPaymentMethods,
  } = useContext(POSContext);
  const { discount } = useContext(DirectSalesContext);

  const {
    show,
    close,
    modalProps: { visible, ...restModalProps },
  } = useModal();

  const orderDetails = order?.orderDetails || [];
  const { totalQuantity, totalPrice } = useOrderCalculations(orderDetails);

  const [selectedMethod, setSelectedMethod] = useState(
    paymentMethods && paymentMethods.length > 0 ? paymentMethods[0] : null
  );

  const [printOrder, setPrintOrder] = useState(null);

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    if (printOrder !== null) {
      handlePrint();
      list("orders");
    }
  }, [printOrder]);

  const handleSuggestedButtonOnClick = (totalMoney: number) => {
    if (paymentMethods) {
      setPayments([
        {
          id: "",
          order: order,
          paymentMethod: paymentMethods[0],
          transactionCode: "",
          paymentStatus: "COMPLETED",
          totalMoney: totalMoney,
          description: "",
          createdAt: 0,
          updatedAt: 0,
        },
      ]);
    }
  };

  const [transferTransactionCode, setTransferTransactionCode] = useState("");
  const [cardTransactionCode, setCardTransactionCode] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirmPayment = (transactionCode: string) => {
    if (!transactionCode || transactionCode.trim() === "") {
      message.error(t("payments.modal.error.transactionCode"));
      return;
    }
    if (selectedMethod && payments && payments.length == 1) {
      const updatedPayments = payments.map((payment) => {
        if (payment.paymentMethod === selectedMethod) {
          return { ...payment, transactionCode: transactionCode };
        }
        return payment;
      });
      setPayments(updatedPayments);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    }
  };

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const showPaymentModal = () => {
    setIsPaymentModalVisible(true);
  };

  const handlePaymentModalOk = () => {
    setIsPaymentModalVisible(false);
  };

  const handlePaymentModalCancel = () => {
    setIsPaymentModalVisible(false);
  };

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

  useEffect(() => {
    if (payments && payments.length == 1) {
      setSelectedMethod(payments[0].paymentMethod);
    }
  }, [payments]);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!paymentMethods && retryCount < 3) {
      refetchPaymentMethods();
      setRetryCount(retryCount + 1);
    }
  }, [paymentMethods, retryCount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRetryCount(0);
    }, 5000); // 5 giây
    return () => clearTimeout(timer);
  }, [retryCount]);

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

  function handleRadioChange(e: RadioChangeEvent): void {
    const paymentMethod = e.target.value;

    setSelectedMethod(paymentMethod);
    setPayments([
      {
        id: "",
        order: order,
        paymentMethod: paymentMethod,
        transactionCode: "",
        paymentStatus: "COMPLETED",
        totalMoney: totalPrice,
        description: "string",
        createdAt: 0,
        updatedAt: 0,
      },
    ]);
  }

  function submitOrder(paymentsParam?: IPaymentResponse[]): void {
    const paymentConvertedPayload: IPaymentRequest[] = paymentToRequest(
      paymentsParam ?? payments
    );

    mutateUpdate(
      {
        resource: "orders/direct/check-out",
        values: {
          payments: paymentConvertedPayload,
        },
        id: order.id,
        successNotification(data, values, resource) {
          return {
            message: t("common.checkout.success"),
            description: t("common.success"),
            type: "success",
          };
        },
        errorNotification: (error: any) => {
          return {
            message: t("common.error") + error.message,
            description: "Oops!.. ",
            type: "error",
          };
        },
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          onClose();
          setPrintOrder(data.data.content);
        },
      }
    );
  }

  const handleSubmitOrder = () => {
    if (payments) {
      if (payments?.length > 1) {
        show();
        return;
      }

      if (calculatePayment(payments, "PENDING") <= 0) {
        message.error(t("orders.notification.tab.checkoutDrawer.error"));
        return;
      }
    }

    const hasEmptyTransactionCode = payments
      ?.filter((payment) => payment.paymentMethod.name !== "Cash")
      ?.some(
        (payment) => !payment.transactionCode || payment.transactionCode === ""
      );

    if (!hasEmptyTransactionCode) {
      const change = calculateChange(payments ?? [], totalPrice, discount);

      if (change < 0) {
        message.error(t("orders.notification.tab.checkoutDrawer.error"));
        return;
      }
      submitOrder();
    } else {
      message.error(t("payments.modal.error.transactionCode"));
    }
  };

  const renderSingleMethod = (methodName: string) => {
    switch (methodName) {
      case "Cash":
        return renderCashMethod();
      case "Transfer":
        return renderTransferMethod();
      case "Card":
        return renderCardMethod();
      default:
        return null;
    }
  };

  const renderCashMethod = () => (
    <Row
      key="cash-method"
      gutter={10}
      style={{
        background: "#f5f5f5",
        padding: "10px",
        borderRadius: "0.5rem",
      }}
    >
      {renderButtons(totalPrice, handleSuggestedButtonOnClick)}
    </Row>
  );

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

  const renderTransferMethod = () => (
    <Row gutter={[16, 24]}>
      <Col span={8}>
        <QRCode
          errorLevel="H"
          value={QRCODE_VALUE}
          icon={QRCODE_ICON_URL}
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        />
      </Col>
      <Col span={16}>
        <Space direction="vertical" className="w-100">
          <Col span={24}>
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
          </Col>
          <Col span={24}>
            <Input
              placeholder={t("payments.fields.transactionCode")}
              value={transferTransactionCode}
              onChange={(e) => setTransferTransactionCode(e.target.value)}
            />
          </Col>
          <Col span={24}>
            <Button
              type="default"
              size={"large"}
              className="w-100"
              icon={
                <AnimatePresence mode="wait">
                  <motion.span
                    key={
                      isSuccess ? "transfer-motion-success" : "transfer-motion"
                    }
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isSuccess ? (
                      <CheckCircleOutlined style={{ color: "green" }} />
                    ) : (
                      <CheckCircleOutlined style={{ visibility: "hidden" }} />
                    )}
                  </motion.span>
                </AnimatePresence>
              }
              onClick={() => handleConfirmPayment(transferTransactionCode)}
            >
              {t("actions.payConfirm")}
            </Button>
          </Col>
        </Space>
      </Col>
    </Row>
  );
  const renderCardMethod = () => (
    <Row gutter={[16, 24]} align="middle">
      <Col span={24}>
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
      </Col>
      <Col span={12}>
        <Input
          placeholder={t("payments.fields.transactionCode")}
          value={cardTransactionCode}
          onChange={(e) => setCardTransactionCode(e.target.value)}
        />
      </Col>
      <Col span={12}>
        <Button
          type="default"
          className="w-100"
          icon={
            <AnimatePresence mode="wait">
              <motion.span
                key={isSuccess ? "card-motion-success" : "card-motion"}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                {isSuccess ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <CheckCircleOutlined style={{ visibility: "hidden" }} />
                )}
              </motion.span>
            </AnimatePresence>
          }
          onClick={() => handleConfirmPayment(cardTransactionCode)}
        >
          {t("actions.payConfirm")}
        </Button>
      </Col>
    </Row>
  );
  const renderMultipleMethods = (payments: IPaymentResponse[]) => {
    if (!payments || payments.length === 0) {
      return null;
    }

    const paymentMethodNames = payments.map(
      (payment) => payment.paymentMethod.name
    );
    const methodsString = paymentMethodNames.join(", ");

    return (
      <Flex gap="middle" justify="space-between" align="center">
        <Space size="large" wrap>
          <Text>{t("payment-methods.payment-methods")}: </Text>
        </Space>
        <Text strong style={{ color: token.colorPrimary }}>
          {methodsString}
        </Text>
      </Flex>
    );
  };

  const renderMethodGroup = (payments: IPaymentResponse[]) => {
    const paymentMethodName =
      payments && payments.length > 0
        ? payments[0].paymentMethod?.name || "Cash"
        : "Cash";

    return (
      <Space direction="vertical" className="w-100">
        <Radio.Group
          name="radiogroup"
          value={selectedMethod}
          onChange={handleRadioChange}
        >
          {paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <Radio key={method.id} value={method}>
                {t(`paymentMethods.options.${method.name}`)}
              </Radio>
            ))
          ) : (
            <p>{t("paymentMethods.noPaymentMethods")}</p>
          )}
        </Radio.Group>

        <Col span={24}>{renderSingleMethod(paymentMethodName)}</Col>
      </Space>
    );
  };

  const renderChange = () => {
    let changeAmount;
    const hasPendingPayment = payments?.find(
      (payment) => payment.paymentStatus === "PENDING"
    );

    if (!payments || hasPendingPayment) {
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

  return (
    <Drawer
      width={breakpoint.sm ? "700px" : "100%"}
      zIndex={1001}
      onClose={onClose}
      open={open}
      style={{ borderTopLeftRadius: "1rem", borderBottomLeftRadius: "1rem" }}
      closable={false}
      footer={
        <Button
          type="primary"
          size={"large"}
          style={{ width: "100%", fontWeight: "500" }}
          onClick={handleSubmitOrder}
        >
          {t("actions.pay")}
        </Button>
      }
    >
      <Row>
        <Col span={24}>
          <Row>
            <Col span={14}>
              <EmployeeSection order={order} />
            </Col>
            <Col span={10} style={{ textAlign: "end" }}>
              <Space wrap>
                <Text>{formatTimestamp(order.createdAt).dateFormat}</Text>
                <Text>{formatTimestamp(order.createdAt).timeFormat}</Text>
                <Button
                  type="text"
                  onClick={onClose}
                  icon={<CloseOutlined />}
                />
              </Space>
            </Col>
          </Row>
          <Divider dashed />
        </Col>
        <Col span={24}>
          {order.customer ? (
            <Title level={3} style={{ color: token.colorPrimary }}>
              {order.customer.fullName}
            </Title>
          ) : (
            <Title level={3}>{t("orders.tab.retailCustomer")}</Title>
          )}
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text>{t("orders.fields.totalPrice")}</Text>
              <Text>{totalQuantity}</Text>
            </Space>
            <Title level={4}>
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                locale={"vi"}
                value={totalPrice}
              />
            </Title>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space wrap>
              <Text>{t("orders.tab.discount")}</Text>
              {order.voucher ? (
                <>
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
                  <Text strong style={{ fontSize: "18px" }}>
                    #{order.voucher.code}
                  </Text>
                </>
              ) : (
                <Tooltip
                  title={
                    !order.customer
                      ? "Khách lẻ không thể sử dụng giảm giá."
                      : ""
                  }
                >
                  <Button
                    disabled={!order.customer}
                    type="text"
                    size="small"
                    icon={
                      <PlusSquareFilled style={{ color: token.colorPrimary }} />
                    }
                    onClick={showDiscountModal}
                  />
                </Tooltip>
              )}
            </Space>
            <Title level={4}>
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                locale={"vi"}
                value={discount}
              />
            </Title>
          </Flex>
        </Col>
        <Divider />
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("orders.tab.amountDue")}</Text>
            </Space>
            <Title level={4} style={{ color: `${token.colorPrimary}` }}>
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                locale={"vi"}
                value={totalPrice - discount}
              />
            </Title>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("orders.tab.customerPay")}</Text>
              <Tooltip title={t("payments.titles.multiple")}>
                <Button
                  size="small"
                  type="text"
                  icon={
                    <CreditCardFilled style={{ color: token.colorPrimary }} />
                  }
                  onClick={showPaymentModal}
                />
              </Tooltip>
            </Space>
            <Title level={4}>{renderTotalPayment()}</Title>
          </Flex>
        </Col>
        <Col span={24}>
          <VoucherMessage order={order} />
        </Col>

        <Divider />
        <Col span={24}>
          {payments && payments.length <= 1 && renderMethodGroup(payments)}
          {payments && payments.length > 1 && renderMultipleMethods(payments)}
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("orders.tab.change")}</Text>
            </Space>
            <Text strong>{renderChange()}</Text>
          </Flex>
        </Col>
      </Row>
      <PaymentModal
        open={isPaymentModalVisible}
        handleOk={handlePaymentModalOk}
        handleCancel={handlePaymentModalCancel}
        order={order}
      />
      <PaymentComfirmModal
        order={order}
        close={close}
        submitOrder={submitOrder}
        modalProps={restModalProps}
      />
      <DiscountModal
        open={isDiscountModalVisible}
        handleOk={handleDiscountModalOk}
        handleCancel={handleDiscountModalCancel}
        customer={order.customer}
        order={order}
      />
      <div className="d-none">
        {printOrder && (
          <InvoiceTemplate order={printOrder} ref={componentRef} />
        )}
      </div>
    </Drawer>
  );
};
