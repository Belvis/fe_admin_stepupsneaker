import { SearchOutlined } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import { App, AutoComplete, Input, Tooltip, theme } from "antd";
import { Fragment, useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { IOrderResponse } from "../../interfaces";
import {
  CloseButtonWrapper,
  CustomerInfor,
  CustomerName,
  EmployeeIcon,
  TextContainer,
} from "./styled";

const { useToken } = theme;

type EmployeeInputSectionProps = {
  order: IOrderResponse;
};

const EmployeeSection: React.FC<EmployeeInputSectionProps> = ({ order }) => {
  const t = useTranslate();
  const { message } = App.useApp();
  const { mode } = useContext(ColorModeContext);
  const { token } = useToken();

  const employeeSection = (
    <>
      <AutoComplete
        style={{
          width: "100%",
        }}
        filterOption={false}
      >
        <Input
          placeholder={t("search.placeholder.employees")}
          suffix={<SearchOutlined />}
        />
      </AutoComplete>
    </>
  );

  const employeeInfoSection = (
    <Tooltip title={t("employees.employees")} placement="left">
      <CustomerInfor span={24} color={mode === "light" ? "#f5f5f5" : ""}>
        <TextContainer>
          <EmployeeIcon
            color={mode === "light" ? token.colorBgMask : "#ffffff"}
          />
          <CustomerName color={token.colorPrimary}>
            {order.employee?.fullName} - {order.employee.phoneNumber}
          </CustomerName>
        </TextContainer>
        <CloseButtonWrapper></CloseButtonWrapper>
      </CustomerInfor>
    </Tooltip>
  );

  return (
    <Fragment>
      {order.employee == null && order.employee == undefined
        ? employeeSection
        : employeeInfoSection}
    </Fragment>
  );
};

export default EmployeeSection;
