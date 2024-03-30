import { useModal } from "@refinedev/antd";
import {
  GetListResponse,
  HttpError,
  useList,
  useTranslate,
} from "@refinedev/core";
import { Flex } from "antd";
import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import { AppIcon } from "../../components/app-icon";
import { ProductModal } from "../../components/point-of-sales/delivery/ProductModal";
import { TabContent } from "../../components/point-of-sales/TabContent";
import {
  IOrderResponse,
  IPaymentMethodResponse,
  IPaymentResponse,
  IProductResponse,
  QueryObserverResult,
} from "../../interfaces";

type POSContextType = {
  selectedProduct: IProductResponse;
  productShow: () => void;
  isLoadingOrder: boolean;
  items: Tab[];
  setItems: React.Dispatch<React.SetStateAction<Tab[]>>;
  setSelectedProduct: React.Dispatch<React.SetStateAction<IProductResponse>>;
  activeKey: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
  refetchOrder: () => Promise<
    QueryObserverResult<GetListResponse<IOrderResponse>, HttpError>
  >;
  refetchPaymentMethods: () => Promise<
    QueryObserverResult<GetListResponse<IPaymentMethodResponse>, HttpError>
  >;
  payments: IPaymentResponse[] | undefined;
  setPayments: React.Dispatch<React.SetStateAction<IPaymentResponse[]>>;
  paymentMethods: IPaymentMethodResponse[] | undefined;
  setPaymentMethods: React.Dispatch<
    React.SetStateAction<IPaymentMethodResponse[] | undefined>
  >;
};
type Tab = {
  label: string;
  children: React.ReactNode;
  key: string;
};

export const initialItems: Tab[] = [
  {
    key: "1",
    label: "Mẫu",
    children: (
      <Flex align="middle" justify="center">
        <AppIcon width={"500px"} height={"500px"} />
      </Flex>
    ),
  },
];

export const POSContext = createContext<POSContextType>({} as POSContextType);

export const POSContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const t = useTranslate();

  const tLabel = t("orders.tab.label");

  const [selectedProduct, setSelectedProduct] = useState<IProductResponse>(
    {} as IProductResponse
  );
  const [items, setItems] = useState<Tab[]>(initialItems);
  const [activeKey, setActiveKey] = useState<string>("1");

  const [payments, setPayments] = useState<IPaymentResponse[]>([]);

  const [paymentMethods, setPaymentMethods] =
    useState<IPaymentMethodResponse[]>();

  const { data: paymentMethodsData, refetch: refetchPaymentMethods } = useList<
    IPaymentMethodResponse,
    HttpError
  >({
    resource: "payment-methods",
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
  });

  useEffect(() => {
    if (
      paymentMethodsData &&
      paymentMethodsData.data &&
      paymentMethodsData.data.length > 0
    ) {
      setPaymentMethods(paymentMethodsData.data);
    }
  }, [paymentMethodsData]);

  const {
    show: productShow,
    close: productClose,
    modalProps: productModalProps,
  } = useModal();

  const {
    data,
    isLoading: isLoadingOrder,
    refetch: refetchOrder,
  } = useList<IOrderResponse, HttpError>({
    resource: "orders",
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "PENDING",
      },
      {
        field: "type",
        operator: "eq",
        value: "OFFLINE",
      },
    ],
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
  });

  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      const fetchedPendingOrder: IOrderResponse[] = [...data.data];
      const newItems = createTabsFromOrders(fetchedPendingOrder);

      setItems(newItems);
      setActiveKey((prevActiveKey) =>
        prevActiveKey === "1"
          ? newItems[0].key
          : newItems[newItems.length - 1].key
      );
    } else {
      setItems(initialItems);
      setActiveKey("1");
    }
  }, [data]);

  const createTabsFromOrders = (orders: IOrderResponse[]): Tab[] => {
    const items = orders.map((order, index) => {
      const customerName = order.customer
        ? order.customer.fullName
        : t("orders.tab.retailCustomer");
      return {
        label: `${tLabel} ${index + 1} - ${customerName}`,
        children: <TabContent order={order} />,
        key: order.id,
      };
    });
    return items;
  };

  return (
    <POSContext.Provider
      value={{
        productShow,
        selectedProduct,
        setSelectedProduct,
        isLoadingOrder,
        items,
        setItems,
        activeKey,
        setActiveKey,
        refetchOrder,
        refetchPaymentMethods,
        payments,
        setPayments,
        paymentMethods,
        setPaymentMethods,
      }}
    >
      {children}

      {selectedProduct.id && (
        <ProductModal
          modalProps={productModalProps}
          close={productClose}
          product={selectedProduct}
          orderId={activeKey}
          callBack={refetchOrder}
        />
      )}
    </POSContext.Provider>
  );
};
