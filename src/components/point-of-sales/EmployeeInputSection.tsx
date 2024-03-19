import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useList, useTranslate, useUpdate } from "@refinedev/core";
import {
  AutoComplete,
  Avatar,
  Button,
  Col,
  Flex,
  Input,
  Row,
  Spin,
  Typography,
  message,
  theme,
} from "antd";
import { debounce } from "lodash";
import { useContext, useState } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { POSContext } from "../../contexts/point-of-sales";
import { IEmployeeResponse, IOption, IOrderResponse } from "../../interfaces";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  TextContainer,
  UserIcon,
} from "./styled";

const { useToken } = theme;

const { Text } = Typography;
type EmployeeInputSectionProps = {
  order: IOrderResponse;
};

const EmployeeSection: React.FC<EmployeeInputSectionProps> = ({ order }) => {
  const t = useTranslate();
  const [messageApi, contextHolder] = message.useMessage();
  const { mutate, isLoading } = useUpdate();
  const { refetchOrder } = useContext(POSContext);
  const { mode } = useContext(ColorModeContext);
  const { token } = useToken();

  const [employeeSearch, setEmployeeSearch] = useState<string>("");
  const [employeeOptions, setEmployeeOptions] = useState<IOption[]>([]);

  const { refetch } = useList<IEmployeeResponse>({
    resource: "employees",
    config: {
      filters: [{ field: "q", operator: "contains", value: employeeSearch }],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: employeeSearch !== "",
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

  function editOrderEmployee(value: string | null): void {
    mutate(
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
            content: t("orders.notification.employee.edit.error"),
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

  const employeeSection = (
    <>
      <AutoComplete
        style={{
          width: "100%",
        }}
        options={employeeOptions}
        onSelect={(_, option: any) => {
          editOrderEmployee(option.employee.id);
        }}
        filterOption={false}
        onSearch={debounce((value: string) => setEmployeeSearch(value), 300)}
      >
        <Input
          placeholder={t("search.placeholder.employees")}
          suffix={<SearchOutlined />}
        />
      </AutoComplete>
    </>
  );

  const employeeInfoSection = (
    <CustomerInfor span={24} color={mode === "light" ? "#f5f5f5" : ""}>
      <TextContainer>
        <UserIcon color={mode === "light" ? token.colorBgMask : "#ffffff"} />
        <CustomerName color={token.colorPrimary}>
          {order.employee?.fullName} - {order.employee.phoneNumber}
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
          onClick={() => editOrderEmployee(null)}
        />
      </CloseButtonWrapper>
    </CustomerInfor>
  );

  return (
    <Spin spinning={isLoading} style={{ width: "100%" }}>
      {contextHolder}
      {order.employee == null && order.employee == undefined
        ? employeeSection
        : employeeInfoSection}
    </Spin>
  );
};

export default EmployeeSection;

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
