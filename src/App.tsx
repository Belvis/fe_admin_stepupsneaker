import { Action, Authenticated, IResourceItem, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { App as AntdApp } from "antd";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { dataProvider } from "./providers/dataProvider";

import {
  ApartmentOutlined,
  DashboardOutlined,
  DollarOutlined,
  ForkOutlined,
  ReadOutlined,
  SafetyOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";

import { MdOutlineAssignmentReturn, MdSecurity } from "react-icons/md";
import { PointOfSaleIcon } from "./components/icons/icon-pos";
import { MdOutlineReviews } from "react-icons/md";

import {
  ColorIcon,
  DiscountOrderIcon,
  DiscountProductIcon,
  MaterialIcon,
  ProductIcon,
  SizeIcon,
  SoleIcon,
  StyleIcon,
  TradeMarkIcon,
} from "./components/icons";
import { DashboardContextProvider } from "./contexts/dashboard";
import { POSContextProvider } from "./contexts/point-of-sales";
import { ReturnFormContextProvider } from "./contexts/return";
import { Header } from "./layouts/header";
import { ThemedSiderV2 } from "./layouts/sider";
import { ThemedTitleV2 } from "./layouts/title";
import { AuthPage } from "./pages/auth";
import {
  CustomerCreate,
  CustomerEdit,
  CustomerList,
  CustomerShow,
} from "./pages/customer";
import { DashboardPage } from "./pages/dashboard";
import { EmployeeCreate, EmployeeEdit, EmployeeList } from "./pages/employee";
import { OrderList, OrderShow } from "./pages/order";
import { PaymentList } from "./pages/payment";
import { PaymentMethodList } from "./pages/payment-method";
import { PointOfSales } from "./pages/point-of-sales";
import { ProdAttributeList } from "./pages/product";
import { ColorList } from "./pages/product/color";
import {
  ProductCreate,
  ProductList,
  ProductShow,
} from "./pages/product/products";
import {
  PromotionCreate,
  PromotionEdit,
  PromotionList,
} from "./pages/promotion";
import { ReturnCreate } from "./pages/return/create";
import { ReturnList } from "./pages/return/list";
import { ReturnShow } from "./pages/return/show";
import { RoleList } from "./pages/role";
import { VoucherCreate, VoucherEdit, VoucherList } from "./pages/voucher";
import { accessControlProvider } from "./providers/accessControlProvider";
import { authProvider } from "./providers/authProvider";
import { ReviewList } from "./pages/review/list";

const API_BASE_URL = `${window.location.protocol}//${
  window.location.hostname
}:${import.meta.env.VITE_BACKEND_API_BASE_PATH}`;

const AUTH_API_URL = `${window.location.protocol}//${
  window.location.hostname
}:${import.meta.env.VITE_BACKEND_API_AUTH_PATH}`;

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params: Record<string, string>) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  const titleHandler = ({
    resource,
    action,
    params,
  }: {
    resource?: IResourceItem;
    action?: Action;
    params?: Record<string, string | undefined>;
  }): string => {
    if (resource && action && params) {
      const resourceName = resource.name;
      switch (action) {
        case "list":
          return `${t(`${resourceName}.${resourceName}`)} | SUNS`;
        case "edit":
          return `${t(`actions.edit`)} ${t(
            `${resourceName}.${resourceName}`
          )} | SUNS`;
        case "show":
          return `${t(`actions.show`)} ${t(
            `${resourceName}.${resourceName}`
          )} | SUNS`;
        case "create":
          return `${t(`actions.create`)} ${t(
            `${resourceName}.${resourceName}`
          )} | SUNS`;
        case "clone":
          return `${t(`actions.clone`)} ${t(
            `${resourceName}.${resourceName}`
          )} | SUNS`;
        default:
          return "SUNS";
      }
    } else {
      return "SUNS";
    }
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <ConfirmDialog />
            <Refine
              dataProvider={dataProvider(API_BASE_URL)}
              authProvider={authProvider(AUTH_API_URL)}
              accessControlProvider={accessControlProvider}
              notificationProvider={useNotificationProvider}
              i18nProvider={i18nProvider}
              routerProvider={routerBindings}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: {
                    label: t("dashboard.title"),
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: "pos",
                  list: "/point-of-sales",
                  meta: {
                    label: t("pos.pos"),
                    icon: <PointOfSaleIcon />,
                  },
                },
                {
                  name: "return-forms",
                  list: "/return-forms",
                  create: "/return-forms/create",
                  edit: "/return-forms/edit/:id",
                  show: "/return-forms/show/:id",
                  meta: {
                    icon: <MdOutlineAssignmentReturn />,
                  },
                },
                {
                  name: "orders",
                  list: "/orders",
                  show: "/orders/show/:id",
                  meta: {
                    icon: <ShoppingOutlined />,
                  },
                },
                {
                  name: "Shop entities",
                  meta: {
                    label: t("shop.title"),
                    icon: <ShopOutlined />,
                  },
                },
                {
                  name: "products",
                  list: "/shop/products",
                  create: "/shop/products/create",
                  edit: "/shop/products/edit/:id",
                  show: "/shop/products/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <ProductIcon />,
                  },
                },
                {
                  name: "colors",
                  list: "/shop/colors",
                  create: "/shop/colors/create",
                  edit: "/shop/colors/edit/:id",
                  show: "/shop/colors/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <ColorIcon />,
                  },
                },
                {
                  name: "brands",
                  list: "/shop/brands",
                  create: "/shop/brands/create",
                  edit: "/shop/brands/edit/:id",
                  show: "/shop/brands/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <TagsOutlined />,
                  },
                },
                {
                  name: "styles",
                  list: "/shop/styles",
                  create: "/shop/styles/create",
                  edit: "/shop/styles/edit/:id",
                  show: "/shop/styles/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <StyleIcon />,
                  },
                },
                {
                  name: "materials",
                  list: "/shop/materials",
                  create: "/shop/materials/create",
                  edit: "/shop/materials/edit/:id",
                  show: "/shop/materials/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <MaterialIcon />,
                  },
                },
                {
                  name: "sizes",
                  list: "/shop/sizes",
                  create: "/shop/sizes/create",
                  edit: "/shop/sizes/edit/:id",
                  show: "/shop/sizes/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <SizeIcon />,
                  },
                },
                {
                  name: "trade-marks",
                  list: "/shop/trade-marks",
                  create: "/shop/trade-marks/create",
                  edit: "/shop/trade-marks/edit/:id",
                  show: "/shop/trade-marks/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <TradeMarkIcon />,
                  },
                },
                {
                  name: "soles",
                  list: "/shop/soles",
                  create: "/shop/soles/create",
                  edit: "/shop/soles/edit/:id",
                  show: "/shop/soles/show/:id",
                  meta: {
                    parent: "Shop entities",
                    icon: <SoleIcon />,
                  },
                },
                {
                  name: "discount",
                  meta: {
                    label: t("discount.title"),
                    icon: <DollarOutlined />,
                  },
                },
                {
                  name: "vouchers",
                  list: "/vouchers",
                  create: "/vouchers/create",
                  edit: "/vouchers/edit/:id",
                  show: "/vouchers/show/:id",
                  meta: {
                    parent: "discount",
                    icon: <DiscountOrderIcon />,
                  },
                },
                {
                  name: "promotions",
                  list: "/promotions",
                  create: "/promotions/create",
                  edit: "/promotions/edit/:id",
                  show: "/promotions/show/:id",
                  meta: {
                    parent: "discount",
                    icon: <DiscountProductIcon />,
                  },
                },
                {
                  name: "product/reviews",
                  list: "/reviews",
                  create: "/reviews/create",
                  edit: "/reviews/edit/:id",
                  show: "/reviews/show/:id",
                  meta: {
                    icon: <MdOutlineReviews />,
                  },
                },
                {
                  name: "customers",
                  list: "/customers",
                  create: "/customers/create",
                  edit: "/customers/edit/:id",
                  show: "/customers/show/:id",
                  meta: {
                    icon: <TeamOutlined />,
                  },
                },
                {
                  name: "employees",
                  list: "/employees",
                  create: "/employees/create",
                  edit: "/employees/edit/:id",
                  show: "/employees/show/:id",
                  meta: {
                    icon: <ApartmentOutlined />,
                  },
                },
                {
                  name: "roles",
                  list: "/roles",
                  create: "/roles/create",
                  edit: "/roles/edit/:id",
                  show: "/roles/show/:id",
                  meta: {
                    icon: <MdSecurity />,
                  },
                },
                {
                  name: "Transactions",
                  meta: {
                    label: t("transactions.title"),
                    icon: <WalletOutlined />,
                  },
                },
                {
                  name: "payments",
                  list: "/transaction/payments",
                  create: "/transaction/payments/create",
                  edit: "/transaction/payments/edit/:id",
                  show: "/transaction/payments/show/:id",
                  meta: {
                    parent: "Transactions",
                    icon: <ReadOutlined />,
                  },
                },
                {
                  name: "payment-methods",
                  list: "/transaction/payment-methods",
                  create: "/transaction/payment-methods/create",
                  edit: "/transaction/payment-methods/edit/:id",
                  show: "/transaction/payment-methods/show/:id",
                  meta: {
                    parent: "Transactions",
                    icon: <ForkOutlined />,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "w0HqFF-uDUAxj-x2TmsR",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <Authenticated
                      key="dashboard"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <ThemedLayoutV2
                        Header={() => <Header sticky />}
                        Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        Title={({ collapsed }) => (
                          <ThemedTitleV2 collapsed={collapsed} />
                        )}
                      >
                        <Outlet />
                      </ThemedLayoutV2>
                    </Authenticated>
                  }
                >
                  <Route
                    index
                    element={
                      <DashboardContextProvider>
                        <DashboardPage />
                      </DashboardContextProvider>
                    }
                  />

                  <Route path="/orders">
                    <Route index element={<OrderList />} />
                    <Route path="show/:id" element={<OrderShow />} />
                  </Route>
                  <Route path="/shop">
                    <Route path="products">
                      <Route index element={<ProductList />} />
                      <Route path="create" element={<ProductCreate />} />
                      <Route path="show/:id" element={<ProductShow />} />
                    </Route>
                    <Route path="colors">
                      <Route index element={<ColorList />} />
                    </Route>
                    <Route path="brands">
                      <Route index element={<ProdAttributeList />} />
                    </Route>
                    <Route path="styles">
                      <Route index element={<ProdAttributeList />} />
                    </Route>
                    <Route path="materials">
                      <Route index element={<ProdAttributeList />} />
                    </Route>
                    <Route path="sizes">
                      <Route index element={<ProdAttributeList />} />
                    </Route>
                    <Route path="soles">
                      <Route index element={<ProdAttributeList />} />
                    </Route>
                    <Route path="trade-marks">
                      <Route index element={<ProdAttributeList />} />
                    </Route>
                  </Route>
                  <Route path="/customers">
                    <Route index element={<CustomerList />} />
                    <Route path="create" element={<CustomerCreate />} />
                    <Route path="edit/:id" element={<CustomerEdit />} />
                    <Route path="show/:id" element={<CustomerShow />} />
                  </Route>
                  <Route path="/vouchers">
                    <Route index element={<VoucherList />} />
                    <Route path="create" element={<VoucherCreate />} />
                    <Route path="edit/:id" element={<VoucherEdit />} />
                  </Route>
                  <Route path="/promotions">
                    <Route index element={<PromotionList />} />
                    <Route path="create" element={<PromotionCreate />} />
                    <Route path="edit/:id" element={<PromotionEdit />} />
                  </Route>
                  <Route path="/employees">
                    <Route index element={<EmployeeList />} />
                    <Route path="create" element={<EmployeeCreate />} />
                    <Route path="edit/:id" element={<EmployeeEdit />} />
                  </Route>
                  <Route path="/reviews">
                    <Route index element={<ReviewList />} />
                    {/* <Route path="create" element={<EmployeeCreate />} /> */}
                    {/* <Route path="edit/:id" element={<EmployeeEdit />} /> */}
                  </Route>
                  <Route path="/roles">
                    <Route index element={<RoleList />} />
                  </Route>
                  <Route path="/transaction">
                    <Route path="payments">
                      <Route index element={<PaymentList />} />
                    </Route>
                    <Route path="payment-methods">
                      <Route index element={<PaymentMethodList />} />
                    </Route>
                  </Route>
                  <Route path="/return-forms">
                    <Route index element={<ReturnList />} />
                    <Route
                      path="create"
                      element={
                        <ReturnFormContextProvider>
                          <ReturnCreate />
                        </ReturnFormContextProvider>
                      }
                    />
                    <Route path="show/:id" element={<ReturnShow />} />
                  </Route>
                  <Route path="/point-of-sales">
                    <Route
                      index
                      element={
                        <POSContextProvider>
                          <PointOfSales />
                        </POSContextProvider>
                      }
                    />
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Route>

                <Route
                  element={
                    <Authenticated key="wrapper" fallback={<Outlet />}>
                      <NavigateToResource resource="dashboard" />
                    </Authenticated>
                  }
                >
                  <Route
                    path="/login"
                    element={
                      <AuthPage
                        type="login"
                        formProps={{
                          initialValues: {
                            email: localStorage.getItem("suns-email") || "",
                            password:
                              localStorage.getItem("suns-password") || "",
                          },
                        }}
                      />
                    }
                  />
                </Route>
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler handler={titleHandler} />
            </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
