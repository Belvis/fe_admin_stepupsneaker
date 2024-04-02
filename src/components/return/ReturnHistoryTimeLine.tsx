import { BaseKey, useTranslate } from "@refinedev/core";
import {
  List as AntdList,
  ConfigProvider,
  ModalProps,
  Tooltip,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";

import { useSimpleList } from "@refinedev/antd";
import { Card, Grid, Modal } from "antd";
import React, { useEffect } from "react";
import { DeliveryStatus, IReturnFormHistoryResponse } from "../../interfaces";
import {
  CreatedAt,
  Number,
  Timeline,
  TimelineContent,
  TimelineItem,
} from "./styled";

const { Text } = Typography;

type ReturnHistoryTimeLineProps = {
  id: BaseKey | undefined;
  modalProps: ModalProps;
  close: () => void;
};

export const ReturnHistoryTimeLine: React.FC<ReturnHistoryTimeLineProps> = ({
  id,
  close,
  modalProps,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { listProps, queryResult } = useSimpleList<IReturnFormHistoryResponse>({
    resource: `return-histories/${id}`,
    sorters: {
      permanent: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    pagination: {
      pageSize: 5,
    },
    syncWithLocation: false,
  });

  const histories: IReturnFormHistoryResponse[] = queryResult.data
    ?.data as IReturnFormHistoryResponse[];

  const getStatusColor = (
    status: DeliveryStatus
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
      case "RECEIVED":
        return {
          indicatorColor: "cyan",
          backgroundColor: "#e6fffb",
          text: "received",
        };
      case "RETURNING":
        return {
          indicatorColor: "green",
          backgroundColor: "#e6f7ff",
          text: "on the way",
        };
      case "COMPLETED":
        return {
          indicatorColor: "blue",
          backgroundColor: "#e6fffb",
          text: "completed",
        };
      default:
        break;
    }
  };

  return (
    <Modal
      {...modalProps}
      title="Lịch sử đơn hàng"
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
      footer={<></>}
    >
      <Card bordered={false}>
        <AntdList
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
                  ({ id, actionStatus, createdAt, createdBy, note }) => {
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
                              `return-forms.timeline.status.${
                                getStatusColor(actionStatus)?.text
                              }`
                            )}
                          </Text>
                          <Text>
                            {t("return-forms.fields.description")}: {note}
                          </Text>
                          <Number strong style={{ cursor: "default" }}>
                            {t("return-forms.fields.createdBy")}: {createdBy}
                          </Number>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  }
                )}
            </Timeline>
          </ConfigProvider>
        </AntdList>
      </Card>
    </Modal>
  );
};
