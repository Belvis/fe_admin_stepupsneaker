import styled from "styled-components";
import { PageHeader as AntdPageHeader } from "@refinedev/antd";

export const PageHeader = styled(AntdPageHeader)`
  @media screen and (max-width: 576px) {
    padding: 16px 16px;

    .pageHeader .ant-page-header-heading-title {
      font-size: 16px;
    }

    .courier-infoBox {
      margin-left: 0;
    }
    .courier {
      flex-direction: column;
    }

    .courier .info-text {
      text-align: center;
      margin-left: 0;
      margin-top: 10px;
    }
    .courier-box-container {
      margin-top: 20px;
    }
  }
`;
