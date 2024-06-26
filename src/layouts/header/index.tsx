import { DownOutlined } from "@ant-design/icons";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import {
  useGetIdentity,
  useGetLocale,
  useSetLocale,
  useTranslate,
} from "@refinedev/core";
import {
  Layout as AntdLayout,
  Avatar,
  Button,
  Dropdown,
  MenuProps,
  Space,
  Switch,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ColorModeContext } from "../../contexts/color-mode";
import { Notifications } from "../../components/notification/Notification";
import {
  decodeToken,
  getRoleFromDecodedToken,
  getToken,
} from "../../helpers/token";

const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const { i18n } = useTranslation();
  const locale = useGetLocale();
  const changeLanguage = useSetLocale();
  const { data } = useGetIdentity<any>();

  const userToken = getToken();
  const decodedToken = decodeToken(userToken);
  const role = getRoleFromDecodedToken(decodedToken);

  const { mode, setMode } = useContext(ColorModeContext);

  const currentLocale = locale();
  dayjs.locale(currentLocale);

  const menuItems: MenuProps["items"] = [...(i18n.languages || [])]
    .sort()
    .map((lang: string) => ({
      key: lang,
      onClick: () => {
        changeLanguage(lang);
        dayjs.locale(lang);
      },
      icon: (
        <span style={{ marginRight: 8 }}>
          <Avatar size={16} src={`/images/flags/${lang}.svg`} />
        </span>
      ),
      label: lang === "en" ? "English" : "Tiếng Việt",
    }));

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space size="middle">
        <Text className="text-start">
          {t("common.access.title")}:{" "}
          <span className="fw-bold">{t(`common.access.role.${role}`)}</span>
        </Text>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <Dropdown
          menu={{
            items: menuItems,
            selectedKeys: currentLocale ? [currentLocale] : [],
          }}
        >
          <Button type="text">
            <Space>
              <Avatar size={16} src={`/images/flags/${currentLocale}.svg`} />
              {currentLocale === "en" ? "English" : "Tiếng Việt"}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Notifications />
        <Space style={{ marginLeft: "8px" }} size="middle">
          {data?.fullName && <Text strong>{data.fullName}</Text>}
          {data?.image && <Avatar src={data.image} alt={data.fullName} />}
        </Space>
      </Space>
    </AntdLayout.Header>
  );
};
