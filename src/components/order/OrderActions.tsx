import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslate, useUpdate } from "@refinedev/core";
import { Button, Space, Tooltip } from "antd";
import { orderToRequest } from "../../helpers/mapper";
import { IOrderResponse, OrderStatus } from "../../interfaces";
import { buttonStyle } from "./style";

const getStatusAction = (status: OrderStatus) => {
  switch (status) {
    case "WAIT_FOR_CONFIRMATION":
      return "WAIT_FOR_DELIVERY";
    case "COMPLETED":
    case "CANCELED":
      return null;
    default:
      return null;
  }
};

type OrderActionProps = {
  record: IOrderResponse;
  callBack: any;
  hideText?: boolean;
};

export const OrderActions: React.FC<OrderActionProps> = ({
  record,
  callBack,
  hideText = false,
}) => {
  const t = useTranslate();
  const { mutate, isLoading } = useUpdate();

  const handleAction = (status: OrderStatus) => {
    const newStatus = getStatusAction(status);
    if (newStatus) {
      const submitData = orderToRequest(record);
      mutate(
        {
          resource: "orders/confirmation-order",
          id: submitData.id,
          values: {
            ...submitData,
            status: newStatus,
          },
        },
        {
          onError: (error, variables, context) => {},
          onSuccess: (data, variables, context) => {
            callBack();
          },
        }
      );
    }
  };

  return (
    <Space size="middle">
      <Tooltip title={t("buttons.accept")}>
        <Button
          loading={isLoading}
          key="accept"
          style={hideText ? undefined : buttonStyle}
          disabled={record.status !== "WAIT_FOR_CONFIRMATION"}
          icon={
            <CheckCircleOutlined
              style={{ color: "#52c41a", fontSize: 17, fontWeight: 500 }}
            />
          }
          onClick={() => handleAction("CANCELED")}
        >
          {hideText ? null : t("buttons.accept")}
        </Button>
      </Tooltip>

      <Tooltip title={t("buttons.reject")}>
        <Button
          loading={isLoading}
          key="reject"
          style={hideText ? undefined : buttonStyle}
          icon={
            <CloseCircleOutlined style={{ color: "#EE2A1E", fontSize: 17 }} />
          }
          disabled={
            record.status === "COMPLETED" ||
            record.status === "CANCELED" ||
            record.status === "RETURNED"
          }
          onClick={() => handleAction(record.status)}
        >
          {hideText ? null : t("buttons.reject")}
        </Button>
      </Tooltip>
    </Space>
  );
};
