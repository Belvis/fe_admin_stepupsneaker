import { AuthProps } from "@refinedev/antd";
import { AuthPage as AntdAuthPage } from "../../components/auth/AuthPage";
import { Link } from "react-router-dom";
import { AppIcon } from "../../components/app-icon";

const authWrapperProps = {
  style: {
    background:
      "radial-gradient(50% 50% at 50% 50%,rgba(255, 255, 255, 0) 0%,rgba(0, 0, 0, 0.5) 100%),url('images/login-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
};

const renderAuthContent = (content: React.ReactNode) => {
  return (
    <div
      style={{
        maxWidth: 408,
        margin: "auto",
      }}
    >
      <Link to="/" className="text-decoration-none">
        <div style={{ marginBottom: 10 }}>
          <AppIcon height={"100px"} width={"408px"} />
        </div>
      </Link>
      {content}
    </div>
  );
};

export const AuthPage: React.FC<AuthProps> = ({ type, formProps }) => {
  return (
    <AntdAuthPage
      type={type}
      wrapperProps={authWrapperProps}
      renderContent={renderAuthContent}
      formProps={formProps}
    />
  );
};
