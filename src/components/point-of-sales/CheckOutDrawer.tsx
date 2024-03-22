import {
  CloseOutlined,
  CreditCardFilled,
  GiftOutlined,
  PlusSquareFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { NumberField } from "@refinedev/antd";
import {
  HttpError,
  useCreateMany,
  useList,
  useNavigation,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  App,
  AutoComplete,
  Avatar,
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
  Spin,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { debounce } from "lodash";
import { useContext, useEffect, useState } from "react";

import _ from "lodash";
import { POSContext } from "../../contexts/point-of-sales";
import { formatTimestamp } from "../../helpers/timestamp";
import {
  IEmployeeResponse,
  IOption,
  IOrderResponse,
  IPaymentMethodResponse,
  IPaymentRequest,
  IPaymentResponse,
  IVoucherListResponse,
} from "../../interfaces";
import { DiscountMessage, DiscountMoney } from "../order/style";
import { DiscountModal } from "./DiscountModal";
import { PaymentModal } from "./PaymentModal";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  TextContainer,
  UserIcon,
} from "./styled";

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
  const { mutate: paymentMutateCreateMany } = useCreateMany();
  const { list } = useNavigation();
  const { message } = App.useApp();
  const breakpoint = Grid.useBreakpoint();

  const { refetchOrder } = useContext(POSContext);

  const orderDetails = order?.orderDetails || [];
  const totalQuantity = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.quantity;
  }, 0);
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);

  const initialPrice = orderDetails.length > 0 ? orderDetails[0].price : 0;
  const [change, setChange] = useState(initialPrice - totalPrice);
  const [discount, setDiscount] = useState(0);
  const [paymentMethods, setPaymentMethods] =
    useState<IPaymentMethodResponse[]>();
  const [selectedMethod, setSelectedMethod] = useState(
    paymentMethods && paymentMethods.length > 0 ? paymentMethods[0] : null
  );
  const [payments, setPayments] = useState<IPaymentResponse[]>();

  useEffect(() => {
    if (payments) {
      const customerPaid = payments.reduce(
        (acc, payment) => acc + payment.totalMoney,
        0
      );
      const changeAmount = customerPaid - (totalPrice - discount);
      setChange(changeAmount);
    }
  }, [payments, totalPrice]);

  useEffect(() => {
    if (order.voucher && order.voucher.type) {
      if (order.voucher.type === "PERCENTAGE") {
        setDiscount((order.voucher.value / 100) * totalPrice);
      } else {
        setDiscount(order.voucher.value);
      }
    }
  }, [order.voucher]);

  const [legitVouchers, setLegitVouchers] = useState<IVoucherListResponse[]>(
    []
  );

  useEffect(() => {
    if (order && order.customer && order.customer.customerVoucherList) {
      const convertedLegitVoucher = _.cloneDeep(
        order.customer.customerVoucherList
      );
      convertedLegitVoucher.map((single) => {
        const updatedVoucher = { ...single };
        if (single.voucher.type === "PERCENTAGE") {
          updatedVoucher.voucher.value =
            (single.voucher.value * calculateTotalPrice(order)) / 100;
        }
        return updatedVoucher;
      });

      convertedLegitVoucher.sort((a, b) => b.voucher.value - a.voucher.value);

      setLegitVouchers(convertedLegitVoucher);
    }
  }, [order.customer]);

  const suggestedMoney = [0, 100000, 200000, 300000];

  const buttons = suggestedMoney.map((money, index) => {
    const totalMoney = totalPrice + money;
    return (
      <Col span={24 / suggestedMoney.length} key={index}>
        <Button
          size="large"
          shape="round"
          key={index}
          onClick={() => {
            if (paymentMethods)
              setPayments([
                {
                  id: "",
                  order: order,
                  paymentMethod: paymentMethods[0],
                  transactionCode: "Cash",
                  paymentStatus: "COMPLETED",

                  totalMoney: totalMoney,
                  description: "Cash",
                  createdAt: 0,
                  updatedAt: 0,
                },
              ]);
          }}
          style={{ width: "100%" }}
        >
          {totalMoney.toLocaleString()}
        </Button>
      </Col>
    );
  });

  const { data } = useList<IPaymentMethodResponse, HttpError>({
    resource: "payment-methods",
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
  });

  const [employeeOptions, setEmployeeOptions] = useState<IOption[]>([]);
  const [value, setValue] = useState<string>("");

  const { refetch: refetchEmployees } = useList<IEmployeeResponse>({
    resource: "employees",
    config: {
      filters: [{ field: "q", operator: "contains", value }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const employeeOptions = data.data.map((item) =>
          renderItem(item.fullName, item.phoneNumber, item.image, item)
        );
        if (employeeOptions.length > 0) {
          setEmployeeOptions(employeeOptions);
        }
      },
    },
  });

  useEffect(() => {
    setEmployeeOptions([]);
    refetchEmployees();
  }, [value]);

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
    if (data && data.data && data.data.length > 0) {
      setPaymentMethods(data.data);
      setPayments([
        {
          id: "",
          order: order,
          paymentMethod: data.data[0],
          transactionCode: "CASH",
          paymentStatus: "COMPLETED",
          totalMoney: totalPrice,
          description: "string",
          createdAt: 0,
          updatedAt: 0,
        },
      ]);
    }
  }, [data]);

  function handleRadioChange(e: RadioChangeEvent): void {
    const paymentMethod = e.target.value;

    setSelectedMethod(paymentMethod);
    setPayments([
      {
        id: "",
        order: order,
        paymentMethod: paymentMethod,
        transactionCode: "CASH",
        paymentStatus: "COMPLETED",
        totalMoney: totalPrice,
        description: "string",
        createdAt: 0,
        updatedAt: 0,
      },
    ]);
  }

  function submitOrder(): void {
    const customerPaid = (payments ?? []).reduce(
      (acc, payment) => acc + payment.totalMoney,
      0
    );

    if (customerPaid < totalPrice - discount) {
      message.error(t("orders.notification.checkoutDrawer.error"));
      return;
    }

    const paymentConvertedPayload: IPaymentRequest[] =
      convertToPayload(payments);

    mutateUpdate(
      {
        resource: "orders/direct/check-out",
        values: {
          ...order,
          customer: order.customer ? order.customer.id : null,
          employee: order.employee ? order.employee.id : null,
          voucher: order.voucher ? order.voucher.id : null,
          address: order.address ? order.address.id : null,
          totalMoney: totalPrice - discount,
          payments: paymentConvertedPayload,
          status: "COMPLETED",
        },
        id: order.id,
        successNotification(data, values, resource) {
          return {
            message: "Thanh toán đơn hàng thành công!",
            description: "Thành công",
            type: "success",
          };
        },
        errorNotification: (error: any) => {
          return {
            message: error.message,
            description: "Đã xảy ra lỗi",
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
          list("orders");
        },
      }
    );
  }

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
      {buttons}
    </Row>
  );

  const renderTransferMethod = () => (
    <Row gutter={[16, 24]}>
      <Col span={8}>
        <QRCode
          errorLevel="H"
          value="00020101021138570010A00000072701270006970436011306910004415480208QRIBFTTA53037045802VN63042141"
          icon="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Icon-Vietcombank.png"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        />
      </Col>
      <Col span={16}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Col span={24}>
            <Select
              showSearch
              placeholder="Select a person"
              optionFilterProp="children"
              style={{ width: "100%" }}
              defaultValue="0691000441548"
              disabled
              options={[
                {
                  value: "0691000441548",
                  label: "VCB - 0691000441548 - NGUYEN ANH TUAN",
                },
              ]}
            />
          </Col>
          <Col span={24}>
            <Input placeholder="Transaction code" />
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              size={"large"}
              style={{ width: "100%" }}
              // onClick={submitOrder}
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
          placeholder="Select a person"
          optionFilterProp="children"
          style={{ width: "100%" }}
          defaultValue="0691000441548"
          disabled
          options={[
            {
              value: "0691000441548",
              label: "VCB - 0691000441548 - NGUYEN ANH TUAN",
            },
          ]}
        />
      </Col>
      <Col span={12}>
        <Input placeholder="Transaction code" />
      </Col>
      <Col span={12}>
        <Button
          type="primary"
          style={{ width: "100%" }}
          // onClick={submitOrder}
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
          <Text>Payment methods: </Text>
        </Space>
        <Text strong style={{ color: token.colorPrimary }}>
          {methodsString}
        </Text>
      </Flex>
    );
  };

  const renderMethodGroup = (payments: IPaymentResponse[]) => {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
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
            <p>Không có phương thức thanh toán nào khả dụng</p>
          )}
        </Radio.Group>

        <Col span={24}>
          {renderSingleMethod(payments[0].paymentMethod.name)}
        </Col>
      </Space>
    );
  };

  function editOrderEmployee(value: string | null): void {
    mutateUpdate(
      {
        resource: "orders",
        values: {
          ...order,
          employee: value,
          customer: order.customer ? order.customer.id : "",
          voucher: order.voucher ? order.voucher.id : "",
          address: order.address ? order.address.id : "",
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
          message.error(t("orders.notification.employee.edit.error"));
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          message.success(t("orders.notification.employee.edit.success"));
        },
      }
    );
  }

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
          onClick={submitOrder}
        >
          {t("actions.pay")}
        </Button>
      }
    >
      <Row>
        <Col span={24}>
          <Row>
            <Col span={14}>
              <Spin spinning={isLoadingOrderUpdate}>
                {order.employee == null && order.employee == undefined ? (
                  <AutoComplete
                    style={{
                      width: "100%",
                    }}
                    options={employeeOptions}
                    onSelect={(_, option: any) => {
                      editOrderEmployee(option.employee.id);
                    }}
                    filterOption={false}
                    onSearch={debounce((value: string) => setValue(value), 300)}
                  >
                    <Input
                      placeholder={t("search.placeholder.employee")}
                      suffix={<SearchOutlined />}
                    />
                  </AutoComplete>
                ) : (
                  <CustomerInfor span={24}>
                    <TextContainer>
                      <UserIcon color={token.colorBgMask} />
                      <CustomerName color={token.colorPrimary}>
                        {order.employee?.fullName} -{" "}
                        {order.employee?.phoneNumber}
                      </CustomerName>
                    </TextContainer>
                    <CloseButtonWrapper>
                      <Button
                        shape="circle"
                        type="link"
                        icon={
                          <CloseOutlined
                            style={{
                              fontSize: token.fontSize,
                              color: token.colorBgMask,
                            }}
                          />
                        }
                        onClick={() => editOrderEmployee(null)}
                      />
                    </CloseButtonWrapper>
                  </CustomerInfor>
                )}
              </Spin>
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
            <Space size="large" wrap>
              <Text>{t("orders.tab.discount")}</Text>
              {order.voucher ? (
                <Text strong style={{ fontSize: "18px" }}>
                  #{order.voucher.code}
                </Text>
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
              <Tooltip title={"Thanh toán nhiều phương thức."}>
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
                "Đang tải..."
              )}
            </Title>
          </Flex>
        </Col>
        <Col span={24}>
          {(() => {
            const voucherDifference =
              legitVouchers && legitVouchers.length > 0
                ? calculateTotalPrice(order) <
                  legitVouchers[0].voucher.constraint
                  ? legitVouchers[0].voucher.constraint -
                    calculateTotalPrice(order)
                  : 0
                : 0;

            const shouldDisplayVoucher = voucherDifference > 0;

            if (shouldDisplayVoucher) {
              return (
                <DiscountMessage level={5}>
                  <GiftOutlined /> Mua thêm{" "}
                  <DiscountMoney>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "symbol",
                    }).format(voucherDifference)}
                  </DiscountMoney>{" "}
                  để được giảm tới{" "}
                  <DiscountMoney>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "symbol",
                    }).format(legitVouchers[0].voucher.value)}
                  </DiscountMoney>
                </DiscountMessage>
              );
            } else {
              return null;
            }
          })()}
        </Col>

        <Divider />
        <Col span={24}>
          {payments?.length === 1 && renderMethodGroup(payments)}
          {payments?.length &&
            payments.length > 1 &&
            renderMultipleMethods(payments)}
        </Col>
        <Col span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Space size="large" wrap>
              <Text strong>{t("orders.tab.change")}</Text>
            </Space>
            <Title level={4}>
              <NumberField
                options={{
                  currency: "VND",
                  style: "currency",
                }}
                value={change}
                locale={"vi"}
              />
            </Title>
          </Flex>
        </Col>
      </Row>
      <PaymentModal
        open={isPaymentModalVisible}
        handleOk={handlePaymentModalOk}
        handleCancel={handlePaymentModalCancel}
        paymentMethods={paymentMethods}
        payments={payments}
        initialPrice={initialPrice}
        totalPrice={totalPrice}
        setPayments={setPayments}
        order={order}
      />
      <DiscountModal
        open={isDiscountModalVisible}
        handleOk={handleDiscountModalOk}
        handleCancel={handleDiscountModalCancel}
        customer={order.customer}
        order={order}
      />
    </Drawer>
  );
};

const renderItem = (
  name: string,
  phoneNumber: string,
  imageUrl: string,
  employee: IEmployeeResponse
) => ({
  value: name,
  label: (
    <Row style={{ display: "flex", alignItems: "center" }}>
      <Col span={6}>
        <Avatar size={32} src={imageUrl} style={{ minWidth: "32px" }} />
      </Col>
      <Col span={18}>
        <Flex vertical>
          <Text>{name}</Text>
          <Text>{phoneNumber}</Text>
        </Flex>
      </Col>
    </Row>
  ),
  employee: employee,
});

function convertToPayload(
  payments: IPaymentResponse[] | undefined
): IPaymentRequest[] {
  if (!payments) return [];
  return payments.map((payment) => ({
    order: payment.order.id,
    paymentMethod: payment.paymentMethod.id,
    totalMoney: payment.totalMoney,
    transactionCode: payment.transactionCode,
  }));
}

const calculateTotalPrice = (order: IOrderResponse): number => {
  if (!order || !order.orderDetails) {
    return 0;
  }

  return order.orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);
};
