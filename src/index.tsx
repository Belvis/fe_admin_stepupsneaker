import React from "react";
import { createRoot } from "react-dom/client";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import WeekDay from "dayjs/plugin/weekday";
import LocaleData from "dayjs/plugin/localeData";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

import App from "./App";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import "./i18n";
import "./assets/scss/style.scss";
import { Spin } from "antd";

dayjs.extend(relativeTime);
dayjs.extend(WeekDay);
dayjs.extend(LocaleData);
dayjs.extend(LocalizedFormat);

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <React.Suspense fallback={<Spin fullscreen />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);
