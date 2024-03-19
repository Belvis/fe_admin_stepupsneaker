/**
 * @fileoverview File này chứa ColorModeContextProvider quản lý chế độ màu và ngôn ngữ của ứng dụng.
 */

import { RefineThemes } from "@refinedev/antd";
import { ConfigProvider, theme } from "antd";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import viVN from "antd/locale/vi_VN";

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

/**
 * Thành phần cung cấp ColorModeContext.
 * @param {PropsWithChildren} props - Props cho thành phần ColorModeContextProvider.
 */
export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  const { i18n } = useTranslation();
  const colorModeFromLocalStorage = localStorage.getItem(
    "suns-admin-colorMode"
  );
  const isSystemPreferenceDark = window?.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const systemPreference = isSystemPreferenceDark ? "dark" : "light";
  const [mode, setMode] = useState(
    colorModeFromLocalStorage || systemPreference
  );

  useEffect(() => {
    window.localStorage.setItem("suns-admin-colorMode", mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        locale={i18n.language == "vi" ? viVN : undefined}
        theme={{
          ...RefineThemes.Orange,
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm,
          token: {
            colorPrimary: "#fb5231",
          },
          components: {
            Steps: {
              iconSize: 48,
              customIconSize: 48,
              customIconFontSize: 30,
              titleLineHeight: 32,
              iconFontSize: 30,
              descriptionMaxWidth: 180,
              fontSize: 16,
              fontSizeLG: 20,
            },
            Table: {
              headerBg: mode === "light" ? "#fb5231" : "#141414",
              headerColor: mode === "light" ? "#ffffff" : undefined,
              headerSplitColor: mode === "light" ? "#ffffff" : undefined,
              rowHoverBg: mode === "light" ? "#fff2e8" : undefined,
              headerSortActiveBg: mode === "light" ? "#bfbfbf" : undefined,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
