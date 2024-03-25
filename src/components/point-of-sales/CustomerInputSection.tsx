import { useContext, useEffect, useState } from "react";
import {
  AutoComplete,
  Input,
  Button,
  Row,
  Col,
  Avatar,
  Typography,
  message,
  Spin,
  theme,
  App,
  Tooltip,
} from "antd";
import { SearchOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { ICustomerResponse, IOption, IOrderResponse } from "../../interfaces";
import { useList, useTranslate, useUpdate } from "@refinedev/core";
import { debounce } from "lodash";
import { useModal } from "@refinedev/antd";
import { CustomerCreateModal } from "../customer/CustomerCreateModal";
import { POSContext } from "../../contexts/point-of-sales";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  TextContainer,
  UserIcon,
} from "./styled";
import { ColorModeContext } from "../../contexts/color-mode";
import { CustomerEditModal } from "./CustomerEditModal";

const { useToken } = theme;

const { Text } = Typography;
type CustomerInputSectionProps = {
  order: IOrderResponse;
};

const CustomerSection: React.FC<CustomerInputSectionProps> = ({ order }) => {
  const t = useTranslate();
  const { message } = App.useApp();
  const { mutate, isLoading } = useUpdate();
  const { refetchOrder } = useContext(POSContext);
  const { mode } = useContext(ColorModeContext);
  const { token } = useToken();

  const {
    show: createShow,
    close: createClose,
    modalProps: createModalProps,
  } = useModal();
  const {
    show: editShow,
    close: editClose,
    modalProps: editModalProps,
  } = useModal();
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [customerOptions, setCustomerOptions] = useState<IOption[]>([]);

  const { refetch: refetchCustomer } = useList<ICustomerResponse>({
    resource: "customers",
    config: {
      filters: [{ field: "q", operator: "contains", value: customerSearch }],
    },
    pagination: {
      pageSize: 10,
    },
    queryOptions: {
      enabled: customerSearch !== "",
      onSuccess: (data) => {
        const customerOptions = data.data.map((item) =>
          renderItem(`${item.fullName} - ${item.email}`, item.image, item)
        );
        if (customerOptions.length > 0) {
          setCustomerOptions(customerOptions);
        }
      },
    },
  });

  useEffect(() => {
    refetchCustomer();
  }, []);
  function editOrderCustomer(value: string | null): void {
    mutate(
      {
        resource: "orders/apply-customer",
        values: {
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
          message.error(t("orders.notification.customer.edit.error"));
        },
        onSuccess: (data, variables, context) => {
          refetchOrder();
          message.success(t("orders.notification.customer.edit.success"));
        },
      }
    );
  }

  const customerSection = (
    <>
      <AutoComplete
        style={{
          width: "90%",
        }}
        options={customerOptions}
        onSelect={(_, option: any) => {
          editOrderCustomer(option.customer.id);
        }}
        filterOption={false}
        onSearch={debounce((value: string) => setCustomerSearch(value), 300)}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder={t("search.placeholder.customers")}
        />
      </AutoComplete>
      <Button
        type="text"
        icon={<PlusOutlined />}
        shape="circle"
        onClick={createShow}
      />
    </>
  );

  const customerInfoSection = (
    <Tooltip title={t("customers.customers")} placement="left">
      <CustomerInfor color={mode === "light" ? "#f5f5f5" : ""} span={24}>
        <TextContainer>
          <UserIcon color={mode === "light" ? token.colorBgMask : "#ffffff"} />
          <CustomerName color={token.colorPrimary} onClick={editShow}>
            {order.customer?.fullName} -{" "}
            {
              order.customer?.addressList.find((add) => add.isDefault === true)
                ?.phoneNumber
            }
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
                  color: mode == "light" ? token.colorBgMask : "#ffffff",
                }}
              />
            }
            onClick={() => editOrderCustomer(null)}
          />
        </CloseButtonWrapper>
      </CustomerInfor>
    </Tooltip>
  );

  return (
    <Spin spinning={isLoading} style={{ width: "100%" }}>
      {order.customer == null && order.customer == undefined
        ? customerSection
        : customerInfoSection}
      <CustomerCreateModal
        modalProps={createModalProps}
        close={createClose}
        callBack={refetchCustomer}
      />
      <CustomerEditModal
        close={editClose}
        modalProps={editModalProps}
        callBack={refetchCustomer}
        id={order.customer?.id}
      />
    </Spin>
  );
};

export default CustomerSection;

const renderItem = (
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
