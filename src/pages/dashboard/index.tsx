import { Card, Col, Flex, Row, Segmented, Select, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { useState } from "react";
import dayjs from "dayjs";
import { SegmentedValue } from "antd/es/segmented";
import { DailyRevenue } from "../../components/dashboard/DailyRevenue";
import { DailyOrders } from "../../components/dashboard/DailyOrders";
import { NewCustomers } from "../../components/dashboard/NewCustomers";
import OverviewTab from "../../components/dashboard/OverViewTab";
import { OrderTimeline } from "../../components/dashboard/OrderTimeline";
import { RecentOrders } from "../../components/dashboard/RecentOrders";
import { TrendingMenu } from "../../components/dashboard/TrendingMenu";
import { OrderTimelineTwo } from "../../components/dashboard/OrderTimelineTwo";

const { Text } = Typography;

type TrendingOption = "Ngày" | "Tuần" | "Tháng" | "Năm";

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTrendingOption, setSelectedTrendingOption] =
    useState<TrendingOption>("Ngày");

  const calculateTimeRange = (option: TrendingOption) => {
    const currentDate = dayjs();

    switch (option) {
      case "Ngày":
        return {
          start: currentDate.startOf("day").valueOf(),
          end: currentDate.endOf("day").valueOf(),
        };
      case "Tuần":
        const startDateWeek = currentDate.startOf("week");
        const endDateWeek = currentDate.endOf("week");

        return {
          start: startDateWeek.valueOf(),
          end: endDateWeek.valueOf(),
        };
      case "Tháng":
        const startDateMonth = currentDate.startOf("month");
        const endDateMonth = currentDate.endOf("month");
        return {
          start: startDateMonth.valueOf(),
          end: endDateMonth.valueOf(),
        };
      case "Năm":
        const startDateYear = currentDate.startOf("year");
        const endDateYear = currentDate.endOf("year");
        return {
          start: startDateYear.valueOf(),
          end: endDateYear.valueOf(),
        };
      default:
        return {
          start: currentDate.valueOf(),
          end: currentDate.valueOf(),
        };
    }
  };

  const handleOptionChange = (value: SegmentedValue) => {
    const option: TrendingOption = value as TrendingOption;
    setSelectedTrendingOption(option);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col md={24}>
        <Row gutter={[16, 16]}>
          <Col xl={10} lg={24} md={24} sm={24} xs={24}>
            <Card
              styles={{
                body: {
                  padding: 10,
                  paddingBottom: 0,
                },
              }}
              style={{
                background: "#081523",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right",
                backgroundSize: "cover",
              }}
            >
              <DailyRevenue />
            </Card>
          </Col>
          <Col xl={7} lg={12} md={24} sm={24} xs={24}>
            <Card
              styles={{
                body: {
                  padding: 10,
                  paddingBottom: 0,
                },
              }}
              style={{
                background: "#081523",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right",
                backgroundSize: "cover",
              }}
            >
              <DailyOrders />
            </Card>
          </Col>
          <Col xl={7} lg={12} md={24} sm={24} xs={24}>
            <Card
              styles={{
                body: {
                  padding: 10,
                  paddingBottom: 0,
                },
              }}
              style={{
                background: "#081523",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right",
                backgroundSize: "cover",
              }}
            >
              <NewCustomers />
            </Card>
          </Col>
        </Row>
      </Col>
      <Col xl={17} lg={16} md={24} sm={24} xs={24}>
        <Card
          styles={{
            body: {
              height: 550,
              paddingLeft: 0,
              paddingRight: 0,
            },
          }}
          title={<Text strong>Biểu đồ phân tích</Text>}
        >
          <OverviewTab />
        </Card>
      </Col>
      <Col xl={7} lg={8} md={24} sm={24} xs={24}>
        <Card
          styles={{
            body: {
              height: 550,
              overflowY: "scroll",
            },
          }}
          title={
            <Text strong style={{ textTransform: "capitalize" }}>
              {t("dashboard.timeline.title")}
            </Text>
          }
        >
          <OrderTimelineTwo />
        </Card>
      </Col>
      <Col xl={17} lg={16} md={24} sm={24} xs={24}>
        <Card title={<Text strong>{t("dashboard.recentOrders.title")}</Text>}>
          <RecentOrders />
        </Card>
      </Col>
      <Col xl={7} lg={8} md={24} sm={24} xs={24}>
        <Card
          title={
            <Flex align="center" justify="space-between">
              <Text strong>{t("dashboard.trendingMenus.title")}</Text>
              <Segmented
                options={["Ngày", "Tuần", "Tháng", "Năm"]}
                onChange={handleOptionChange}
              />
            </Flex>
          }
        >
          <TrendingMenu range={calculateTimeRange(selectedTrendingOption)} />
        </Card>
      </Col>
    </Row>
  );
};
