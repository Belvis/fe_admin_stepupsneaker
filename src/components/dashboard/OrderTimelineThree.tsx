import { BaseKey, useNavigation, useTranslate } from "@refinedev/core";
import {
  List as AntdList,
  ConfigProvider,
  Grid,
  Modal,
  ModalProps,
  Tooltip,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";

import { useSimpleList } from "@refinedev/antd";
import React, { useEffect } from "react";
import { IOrderHistoryResponse, OrderStatus } from "../../interfaces";
import {
  CreatedAt,
  Number,
  Timeline,
  TimelineContent,
  TimelineItem,
} from "./styled";

const { Text } = Typography;
type OrderTimelineThreeProps = {
  modalProps: ModalProps;
  close: () => void;
  id: BaseKey | undefined;
};

export const OrderTimelineThree: React.FC<OrderTimelineThreeProps> = ({
  modalProps,
  close,
  id,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const {
    listProps,
    queryResult: { refetch, data },
  } = useSimpleList<IOrderHistoryResponse>({
    resource: "order-histories",
    filters: {
      permanent: [
        {
          field: "order",
          operator: "eq",
          value: id,
        },
      ],
    },
    sorters: {
      permanent: [
        {
          field: "createdAt",
          order: "asc",
        },
      ],
    },
    pagination: {
      pageSize: 4,
    },
    syncWithLocation: false,
  });

  const histories = data?.data;

  const getStatusColor = (
    status: OrderStatus
  ):
    | { indicatorColor: string; backgroundColor: string; text: string }
    | undefined => {
    switch (status) {
      case "PENDING":
        return {
          indicatorColor: "orange",
          backgroundColor: "#fff7e6",
          text: "pending",
        };
      case "WAIT_FOR_CONFIRMATION":
        return {
          indicatorColor: "cyan",
          backgroundColor: "#e6fffb",
          text: "waiting",
        };
      case "DELIVERING":
        return {
          indicatorColor: "green",
          backgroundColor: "#e6f7ff",
          text: "on the way",
        };
      case "WAIT_FOR_DELIVERY":
        return {
          indicatorColor: "gray",
          backgroundColor: "#f1f1f1",
          text: "ready",
        };
      case "COMPLETED":
        return {
          indicatorColor: "blue",
          backgroundColor: "#e6fffb",
          text: "delivered",
        };
      case "CANCELED":
      case "EXPIRED":
      case "RETURNED":
        return {
          indicatorColor: "purple",
          backgroundColor: "#f9f0ff",
          text: "returned",
        };
      case "EXCHANGED":
        return {
          indicatorColor: "red",
          backgroundColor: "#fff1f0",
          text: "cancelled",
        };
      default:
        break;
    }
  };

  useEffect(() => {
    if (modalProps.open) {
      refetch();
    }
  }, [modalProps.open]);

  return (
    <Modal
      {...modalProps}
      title={t("orders.orders")}
      zIndex={1001}
      width={breakpoint.sm ? "500px" : "100%"}
      footer={<></>}
    >
      <AntdList
        className="mt-3"
        {...listProps}
        pagination={{
          ...listProps.pagination,
          simple: true,
          showSizeChanger: false,
          hideOnSinglePage: true,
        }}
      >
        <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
          <Timeline>
            {histories &&
              histories.length > 0 &&
              histories.map(
                ({
                  id,
                  actionStatus,
                  createdAt,
                  orderId,
                  orderCode,
                  createdBy,
                }) => {
                  return (
                    <TimelineItem
                      key={id}
                      color={getStatusColor(actionStatus)?.indicatorColor}
                    >
                      <TimelineContent
                        backgroundColor={
                          getStatusColor(actionStatus)?.backgroundColor ||
                          "transparent"
                        }
                      >
                        <Tooltip
                          overlayInnerStyle={{ color: "#626262" }}
                          color="rgba(255, 255, 255, 0.3)"
                          placement="topLeft"
                          title={dayjs(createdAt).format("lll")}
                        >
                          <CreatedAt italic>
                            {dayjs(createdAt).fromNow()}
                          </CreatedAt>
                        </Tooltip>
                        <Text>
                          {t(
                            `dashboard.timeline.orderStatuses.${
                              getStatusColor(actionStatus)?.text
                            }`
                          )}
                        </Text>
                        <Number strong>#{orderCode}</Number>
                        <Text strong>Bởi: {createdBy}</Text>
                      </TimelineContent>
                    </TimelineItem>
                  );
                }
              )}
          </Timeline>
        </ConfigProvider>
      </AntdList>
    </Modal>
  );
};
