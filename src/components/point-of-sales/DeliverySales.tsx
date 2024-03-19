import {
  CheckOutlined,
  CloseOutlined,
  CreditCardFilled,
  PlusSquareFilled,
  SearchOutlined,
} from "@ant-design/icons";
import {
  HttpError,
  useCreateMany,
  useCustom,
  useCustomMutation,
  useList,
  useNavigation,
  useTranslate,
  useUpdate,
} from "@refinedev/core";
import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { debounce } from "lodash";
import { useContext, useEffect, useState } from "react";

import { NumberField } from "@refinedev/antd";
import { formatTimestamp } from "../../helpers/timestamp";
import {
  validateCommon,
  validateFullName,
  validatePhoneNumber,
} from "../../helpers/validate";
import {
  ICustomerResponse,
  IDistrictResponse,
  IEmployeeResponse,
  IOption,
  IOrderResponse,
  IPaymentMethodResponse,
  IPaymentRequest,
  IPaymentResponse,
  IProvinceResponse,
  ITransportAddress,
  IWardResponse,
} from "../../interfaces";
import { DiscountModal } from "./DiscountModal";
import { OrderItem } from "./OrderItem";
import { PaymentModal } from "./PaymentModal";
import ShoppingCartHeader from "./ShoppingCartHeader";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  TextContainer,
  UserIcon,
} from "./styled";
import { POSContext } from "../../contexts/point-of-sales";
import { DeliverySalesLeft } from "./DeliverySalesLeft";
import { DeliverySalesRight } from "./DeliverySalesRight";
const { useToken } = theme;
const { Text, Title } = Typography;

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID;
const GHN_TOKEN = import.meta.env.VITE_GHN_USER_TOKEN;

const filterOption = (
  input: string,
  option?: { label: string; value: number }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

type DeliverySalesProps = {
  order: IOrderResponse;
};

export const DeliverySales: React.FC<DeliverySalesProps> = ({ order }) => {
  const t = useTranslate();
  const { token } = useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const { refetchOrder } = useContext(POSContext);

  const [value, setValue] = useState<string>("");
  const [customerOptions, setCustomerOptions] = useState<IOption[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<IOption[]>([]);
  const [valueEmployee, setValueEmployee] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] =
    useState<IPaymentMethodResponse[]>();
  const [payments, setPayments] = useState<IPaymentResponse[]>();

  const [form] = Form.useForm<ITransportAddress>();
  const [provinces, setProvinces] = useState<IProvinceResponse[]>([]);
  const [districts, setDistricts] = useState<IDistrictResponse[]>([]);
  const [wards, setWards] = useState<IWardResponse[]>([]);
  const provinceId = Form.useWatch("provinceId", form);
  const districtId = Form.useWatch("districtId", form);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [shippingMoney, setShippingMoney] = useState(0);

  const { list } = useNavigation();
  const { mutate: calculateFeeMutate } = useCustomMutation<any>();
  const { mutate: paymentMutateCreateMany } = useCreateMany();

  const { mutate: mutateUpdate } = useUpdate();
  const { refetch: refetchCustomer } = useList<ICustomerResponse>({
    resource: "customers",
    config: {
      filters: [{ field: "q", operator: "contains", value }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const customerOptions = data.data.map((item) =>
          renderItemCustomer(
            `${item.fullName} - ${item.email}`,
            item.image,
            item
          )
        );
        if (customerOptions.length > 0) {
          setCustomerOptions(customerOptions);
        }
      },
    },
  });

  const { refetch: refetchEmployees } = useList<IEmployeeResponse>({
    resource: "employees",
    config: {
      filters: [{ field: "q", operator: "contains", value: valueEmployee }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const employeeOptions = data.data.map((item) =>
          renderItemEmployee(item.fullName, item.phoneNumber, item.image, item)
        );
        if (employeeOptions.length > 0) {
          setEmployeeOptions(employeeOptions);
        }
      },
    },
  });

  const { data, isLoading } = useList<IPaymentMethodResponse, HttpError>({
    resource: "payment-methods",
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
  });

  const { isLoading: isLoadingProvince, refetch: refetchProvince } = useCustom<
    IProvinceResponse[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/province`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setProvinces(data.response.data);
      },
    },
  });

  const { isLoading: isLoadingDistrict, refetch: refetchDistrict } = useCustom<
    IDistrictResponse[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/district`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
      query: {
        province_id: provinceId,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setDistricts(data.response.data);
      },
    },
  });

  const { isLoading: isLoadingWard, refetch: refetchWard } = useCustom<
    IWardResponse[]
  >({
    url: `${GHN_API_BASE_URL}/master-data/ward`,
    method: "get",
    config: {
      headers: {
        token: GHN_TOKEN,
      },
      query: {
        district_id: districtId,
      },
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data: any) => {
        setWards(data.response.data);
      },
    },
  });

  useEffect(() => {
    setProvinces([]);
    refetchProvince();
  }, []);

  useEffect(() => {
    if (provinceId) {
      setDistricts([]);
      refetchDistrict();
    }
  }, [provinceId]);

  useEffect(() => {
    if (districtId) {
      setWards([]);
      refetchWard();
    }
  }, [districtId]);

  useEffect(() => {
    setCustomerOptions([]);
    refetchCustomer();
  }, [value]);

  useEffect(() => {
    setEmployeeOptions([]);
    refetchEmployees();
  }, [valueEmployee]);

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

  useEffect(() => {}, [order]);

  const orderDetails = order?.orderDetails || [];
  const initialPrice = orderDetails.length > 0 ? orderDetails[0].price : 0;
  const totalQuantity = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.quantity;
  }, 0);
  const totalPrice = orderDetails.reduce((total, orderDetail) => {
    return total + orderDetail.totalPrice;
  }, 0);
  const [change, setChange] = useState(initialPrice - totalPrice);
  const [discount, setDiscount] = useState(0);

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
    if (payments) {
      const customerPaid = payments.reduce(
        (acc, payment) => acc + payment.totalMoney,
        0
      );
      const changeAmount = customerPaid - (totalPrice - discount);
      setChange(changeAmount);
    }
  }, [payments]);

  useEffect(() => {
    if (order.voucher && order.voucher.type) {
      if (order.voucher.type === "PERCENTAGE") {
        setDiscount((order.voucher.value / 100) * totalPrice);
      } else {
        setDiscount(order.voucher.value);
      }
    }
  }, [order.voucher]);

  const handleProvinceChange = (value: number, option: any) => {
    setProvinceName(option.label);
  };

  const handleDistrictChange = (value: number, option: any) => {
    setDistrictName(option.label);
  };

  const handleWardChange = (value: number, option: any) => {
    setWardName(option.label);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

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

  function editOrderCustomer(value: string | null): void {
    mutateUpdate(
      {
        resource: "orders",
        values: {
          ...order,
          employee: order.employee ? order.employee.id : null,
          voucher: order.voucher ? order.voucher.id : null,
          customer: value,
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
            content:
              t("orders.notification.customer.edit.error") +
              " " +
              error.message,
          });
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          messageApi.open({
            type: "success",
            content: t("orders.notification.customer.edit.success"),
          });
        },
      }
    );
  }

  function editOrderEmployee(value: string | null): void {
    mutateUpdate(
      {
        resource: "orders",
        values: {
          ...order,
          employee: value,
          customer: order.customer ? order.customer.id : null,
          voucher: order.voucher ? order.voucher.id : null,
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
            content:
              t("orders.notification.employee.edit.error") +
              " " +
              error.message,
          });
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          messageApi.open({
            type: "success",
            content: t("orders.notification.employee.edit.siccess"),
          });
        },
      }
    );
  }

  function calculateShippingFee(): void {
    calculateFeeMutate(
      {
        url: `${GHN_API_BASE_URL}/v2/shipping-order/fee`,
        method: "post",
        values: {
          from_district_id: 1542,
          service_id: 53321,
          to_district_id: form.getFieldValue("districtId"),
          to_ward_code: form.getFieldValue("wardCode"),
          height: form.getFieldValue("height"),
          length: form.getFieldValue("length"),
          weight: form.getFieldValue("weight"),
          width: form.getFieldValue("width"),
          insurance_value: 500000,
        },
        config: {
          headers: {
            "Content-Type": "application/json",
            Token: GHN_TOKEN,
            ShopId: GHN_SHOP_ID,
          },
        },
        successNotification: (data: any, values) => {
          const shippingMoney = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            currencyDisplay: "symbol",
          }).format(data?.response.data.total as number);

          return {
            message:
              "Chi phí vận chuyển của bạn được ước tính là " + shippingMoney,
            description: "Thành công",
            type: "success",
          };
        },
        errorNotification: (data, values) => {
          const shippingMoney = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            currencyDisplay: "symbol",
          }).format(36500);

          return {
            message:
              "Chi phí vận chuyển của bạn được ước tính là " + shippingMoney,
            description: "Thành công",
            type: "success",
          };
        },
      },
      {
        onError: (error, variables, context) => {
          console.log("An error occurred! ", +error);

          const shippingMoney = 36500;
          setShippingMoney(shippingMoney);
        },
        onSuccess: (data: any, variables, context) => {
          const shippingMoney = data?.response.data.total as number;

          setShippingMoney(shippingMoney);
        },
      }
    );
  }

  function submitOrder(): void {
    const submitData = {
      ...order,
      customer: order.customer ? order.customer.id : null,
      employee: order.employee ? order.employee.id : null,
      voucher: order.voucher ? order.voucher.id : null,
      fullName: form.getFieldValue("fullName"),
      shippingMoney: shippingMoney,
      type: "ONLINE",
      totalMoney: totalPrice - discount + shippingMoney,
      status: "WAIT_FOR_CONFIRMATION",
    };

    mutateUpdate(
      {
        resource: "orders",
        values: submitData,
        id: order.id,
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          const convertedPayload: IPaymentRequest[] =
            convertToPayload(payments);
          paymentMutateCreateMany(
            {
              resource: "payments",
              values: convertedPayload,
            },
            {
              onError: (error, variables, context) => {},
              onSuccess: (data, variables, context) => {
                list("orders");
              },
            }
          );
        },
      }
    );
  }

  return (
    <Row gutter={[16, 24]} style={{ height: "100%" }}>
      <DeliverySalesLeft order={order} />
      <DeliverySalesRight order={order} />

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
      <DiscountModal
        open={isDiscountModalVisible}
        handleOk={handleDiscountModalOk}
        handleCancel={handleDiscountModalCancel}
        customer={order.customer}
        order={order}
      />
    </Row>
  );
};

const renderItemCustomer = (
  title: string,
  imageUrl: string,
  customer: ICustomerResponse
) => ({
  value: title,
  label: (
    <Row style={{ display: "flex", alignItems: "center" }}>
      <Col span={4}>
        <Avatar size={48} src={imageUrl} style={{ minWidth: "48px" }} />
      </Col>
      <Col span={20}>
        <Text style={{ marginLeft: "16px" }}>{title}</Text>
      </Col>
    </Row>
  ),
  customer: customer,
});

const renderItemEmployee = (
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
