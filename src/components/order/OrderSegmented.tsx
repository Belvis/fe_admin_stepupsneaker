import { useTranslate } from "@refinedev/core";
import { Badge, FormProps, Segmented, Typography } from "antd";
import { SegmentedProps, SegmentedValue } from "antd/es/segmented";
import { useEffect, useState } from "react";
import { IOrderNotificationResponse } from "../../interfaces";

const { Text } = Typography;

type OrderSegmentedProps = {
  formProps: FormProps;
  callBack: any;
};

const API_SSE_URL = `${window.location.protocol}//${window.location.hostname}:${
  import.meta.env.VITE_BACKEND_API_SSE_PATH
}`;

export const OrderSegmented: React.FC<OrderSegmentedProps> = ({
  formProps,
  callBack,
}) => {
  const t = useTranslate();

  const [allStatusCount, setAllStatusCount] = useState<number>(0);
  const [confirmStatusCount, setConfirmStatusCount] = useState<number>(0);
  const [deliveryStatusCount, setDeliveryStatusCount] = useState<number>(0);
  const [deliveringStatusCount, setDeliveringStatusCount] = useState<number>(0);
  const [completedStatusCount, setCompletedStatusCount] = useState<number>(0);
  const [canceledStatusCount, setCanceledStatusCount] = useState<number>(0);

  useEffect(() => {
    callBack();
  }, [confirmStatusCount]);

  const updateStatusCounts = (
    newNotifications: IOrderNotificationResponse[]
  ) => {
    let confirmCount = 0;
    let deliveryCount = 0;
    let deliveringCount = 0;
    let completedCount = 0;
    let canceledCount = 0;

    newNotifications.forEach((notification) => {
      switch (notification.status) {
        case "WAIT_FOR_CONFIRMATION":
          confirmCount += notification.count;
          break;
        case "WAIT_FOR_DELIVERY":
          deliveryCount += notification.count;
          break;
        case "DELIVERING":
          deliveringCount += notification.count;
          break;
        case "COMPLETED":
          completedCount += notification.count;
          break;
        case "CANCELED":
          canceledCount += notification.count;
          break;
        default:
          break;
      }
    });

    setConfirmStatusCount(confirmCount);
    setDeliveryStatusCount(deliveryCount);
    setDeliveringStatusCount(deliveringCount);
    setCompletedStatusCount(completedCount);
    setCanceledStatusCount(canceledCount);
    setAllStatusCount(
      confirmCount +
        deliveringCount +
        deliveryCount +
        completedCount +
        canceledCount
    );
  };

  useEffect(() => {
    const eventSource = new EventSource(`${API_SSE_URL}/orders`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.length > 0) {
        updateStatusCounts(data);
        callBack();
      }
    };

    eventSource.addEventListener("close", () => {
      console.log("Connection closed");
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const options: SegmentedProps["options"] = [
    {
      label: (
        <Badge count={allStatusCount} size="small">
          <Text>{t("enum.orderStatuses.ALL")}</Text>
        </Badge>
      ),
      value: null as any,
    },
    {
      label: (
        <Badge count={confirmStatusCount} size="small">
          <Text>{t("enum.orderStatuses.WAIT_FOR_CONFIRMATION")}</Text>
        </Badge>
      ),
      value: "WAIT_FOR_CONFIRMATION",
    },
    {
      label: (
        <Badge count={deliveryStatusCount} size="small">
          <Text>{t("enum.orderStatuses.WAIT_FOR_DELIVERY")}</Text>
        </Badge>
      ),
      value: "WAIT_FOR_DELIVERY",
    },
    {
      label: (
        <Badge count={deliveringStatusCount} size="small">
          <Text>{t("enum.orderStatuses.DELIVERING")}</Text>
        </Badge>
      ),
      value: "DELIVERING",
    },
    {
      label: (
        <Badge count={completedStatusCount} size="small">
          <Text>{t("enum.orderStatuses.COMPLETED")}</Text>
        </Badge>
      ),
      value: "COMPLETED",
    },
    {
      label: (
        <Badge count={canceledStatusCount} size="small">
          <Text>{t("enum.orderStatuses.CANCELED")}</Text>
        </Badge>
      ),
      value: "CANCELED",
    },
  ];

  return (
    <Segmented
      size="large"
      block
      options={options}
      onChange={(value: SegmentedValue) => {
        formProps.form?.setFieldValue("status", value);
        formProps.form?.submit();
      }}
    />
  );
};
