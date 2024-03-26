import React, { useContext, useEffect, useState } from "react";

import {
  BellOutlined,
  CheckOutlined,
  MoreOutlined,
  SelectOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Divider,
  Flex,
  Popover,
  Row,
  Segmented,
  Skeleton,
  Space,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

import { Link } from "react-router-dom";
import styled from "styled-components";
import { BellIcon } from "../icons/icon-bell";
import { ColorModeContext } from "../../contexts/color-mode";
import { INotificationResponse } from "../../interfaces";
import {
  getAllNotifications,
  markNotificationAsRead,
  readAllNotifications,
} from "../../services/notificationService";
import { CustomAvatar } from "./CustomAvatar";
import { NotificationMessage } from "./NotificationMessage";

const API_SSE_URL = `${window.location.protocol}//${window.location.hostname}:${
  import.meta.env.VITE_BACKEND_API_SSE_PATH
}`;

export const Notifications: React.FC = () => {
  const { mode } = useContext(ColorModeContext);

  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotificationResponse[]>(
    []
  );
  const [uneadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [segment, setSegment] = useState("Tất cả");

  const query: {
    pageSize: number;
    sortBy?: string;
  } = {
    pageSize: 5,
    sortBy: "createdAt",
  };

  const fetchNotifications = async () => {
    try {
      const { data, totalElements } = await getAllNotifications(segment, query);
      setTotalCount(totalElements);
      setNotifications(data);
      setInitLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const readNotification = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleReadAll = async () => {
    try {
      setLoading(true);
      await readAllNotifications();
      await fetchNotifications();
      setLoading(false);
      setMoreOpen(false);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleSegmentChange = (value: string) => {
    setSegment(value);
  };

  const handleSSEMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data && data.length > 0) {
      setNotifications((prevNotifications) => [...data, ...prevNotifications]);
    }
  };

  const handleSSEClose = () => {
    console.log("Connection closed");
  };

  const onLoadMore = () => {
    setLoading(true);
    setNotifications((prev) =>
      prev.concat([...new Array(3)].map(() => ({} as INotificationResponse)))
    );
    query.pageSize += 5;
    fetchNotifications().then(() => {
      setLoading(false);
      window.dispatchEvent(new Event("resize"));
    });
  };

  useEffect(() => {
    fetchNotifications();
    const eventSource = new EventSource(API_SSE_URL);
    eventSource.onmessage = handleSSEMessage;
    eventSource.addEventListener("close", handleSSEClose);
    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [segment]);

  useEffect(() => {
    if (notifications) {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.read && notification.id
      );
      setUnreadCount(unreadNotifications.length);
    }
  }, [notifications]);

  const loadMore =
    !initLoading && !loading && notifications.length != totalCount ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          lineHeight: "32px",
        }}
      >
        <Button type="text" onClick={onLoadMore}>
          Xem thêm
        </Button>
      </div>
    ) : null;

  const moreContent = (
    <div className="more-content" style={{ width: "100%" }}>
      <MoreContent gutter={[16, 24]}>
        <Col span={3}>
          <CheckOutlined />
        </Col>
        <Col span={21} onClick={handleReadAll}>
          <Text strong>Đánh dấu là đã đọc</Text>
        </Col>
      </MoreContent>
      <MoreContent gutter={[16, 24]}>
        <Col span={3}>
          <SettingOutlined />
        </Col>
        <Col span={21}>
          <Text strong>Cài đặt thông báo</Text>
        </Col>
      </MoreContent>
      <MoreContent gutter={[16, 24]}>
        <Col span={3}>
          <SelectOutlined />
        </Col>
        <Col span={21}>
          <Text strong>Mở thông báo</Text>
        </Col>
      </MoreContent>
    </div>
  );

  const content = (
    <React.Fragment>
      <div className="noti-header" style={{ marginBottom: "1rem" }}>
        <Row align="middle" justify="space-between">
          <Text strong style={{ fontSize: "24px" }}>
            Thông báo
          </Text>
          <Popover
            placement="bottomRight"
            content={moreContent}
            trigger="click"
            open={moreOpen}
            onOpenChange={(newOpen) => {
              setMoreOpen(newOpen);
            }}
            overlayStyle={{ width: 250 }}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentNode as HTMLElement
            }
          >
            <Button
              shape="circle"
              icon={<MoreOutlined />}
              style={{
                border: 0,
                backgroundColor: mode === "light" ? "#F7F8F9" : undefined,
              }}
            />
          </Popover>
        </Row>
        <Row style={{ marginTop: "0.25rem" }}>
          <Segmented
            onChange={handleSegmentChange}
            options={["Tất cả", "Chưa đọc"]}
          />
        </Row>
      </div>
      <Space
        direction="vertical"
        split={<Divider style={{ margin: 0 }} />}
        style={{ width: "100%" }}
      >
        {notifications && notifications.length <= 0 && (
          <div style={{ textAlign: "center" }}>
            <BellIcon style={{ fontSize: "72px" }} />
            <p className="text-center">Bạn không có thông báo nào</p>
          </div>
        )}
        {notifications &&
          notifications.length > 0 &&
          notifications.map((noti, index) => (
            <Link
              className="text-decoration-none"
              to={noti.href}
              onClick={() => {
                readNotification(noti.id);
                setOpen(false);
              }}
              key={index}
            >
              <Skeleton
                avatar
                title={false}
                loading={!noti.id}
                active
                key={index}
              >
                <Flex justify="space-between" align="center" key={index}>
                  <Space key={index}>
                    <CustomAvatar
                      size={48}
                      shape="square"
                      src={
                        noti.customer
                          ? noti.customer.image
                          : "https://res.cloudinary.com/dwoxggxq7/image/upload/w_400,h_400,c_scale/su1bf6xpowuscnuuerwm.jpg"
                      }
                      name={noti.content}
                    />
                    <Space direction="vertical" size={0}>
                      <NotificationMessage
                        content={noti.content}
                        type={noti.notificationType}
                      />
                      <Text type="secondary">
                        {dayjs(new Date(noti.createdAt)).fromNow()}
                      </Text>
                    </Space>
                  </Space>
                  <div>{!noti.read && <Badge status="processing" />}</div>
                </Flex>
              </Skeleton>
            </Link>
          ))}
        {loadMore}
      </Space>
    </React.Fragment>
  );

  return (
    <Popover
      placement="bottomRight"
      content={initLoading ? loadingContent : content}
      trigger="click"
      open={open}
      onOpenChange={(newOpen) => {
        console.log(newOpen);

        setMoreOpen(false);
        setOpen(newOpen);
      }}
      overlayStyle={{ width: 400, maxHeight: "500px", overflow: "auto" }}
    >
      <Badge count={uneadCount} size="small">
        <Button
          shape="circle"
          icon={<BellOutlined />}
          style={{
            border: 0,
            backgroundColor: mode === "light" ? "#F7F8F9" : undefined,
          }}
        />
      </Badge>
    </Popover>
  );
};

const MoreContent = styled(Row)`
  cursor: pointer;
  transition: background-color 0.3s ease;
  widows: 100%;
  padding: 5px;
  border-radius: 5px;
  &:hover {
    background-color: #fff2e8;
  }
`;

const loadingContent = (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 20,
    }}
  >
    <Spin />
  </div>
);
