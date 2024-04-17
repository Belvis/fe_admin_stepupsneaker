import { useModal } from "@refinedev/antd";
import {
  GetListResponse,
  HttpError,
  useList,
  useTranslate,
} from "@refinedev/core";
import { Flex, TablePaginationConfig } from "antd";
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
import {
  FilterType,
  SorterType,
  blankFilters,
  initialSorters,
} from "./direct-sales";

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
  filters: FilterType;
  setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
  sorters: SorterType;
  products: IProductResponse[];
  setSorters: React.Dispatch<React.SetStateAction<SorterType>>;
  isLoadingProduct: boolean;
  refetchProducts: () => Promise<
    QueryObserverResult<GetListResponse<IProductResponse>, HttpError>
  >;
  pagination: TablePaginationConfig;
  setPagination: React.Dispatch<React.SetStateAction<TablePaginationConfig>>;
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
      setActiveKey((prevActiveKey) => {
        console.log("prevActiveKey", prevActiveKey);

        if (prevActiveKey === "1" || !prevActiveKey) {
          return newItems[newItems.length - 1].key;
        }

        return prevActiveKey;
      });
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

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 6,
    total: 0,
  });

  const [filters, setFilters] = useState<FilterType>(blankFilters);
  const [sorters, setSorters] = useState<SorterType>(initialSorters);

  const {
    data: dataProduct,
    isLoading: isLoadingProduct,
    refetch: refetchProducts,
  } = useList<IProductResponse, HttpError>({
    resource: "products",
    filters: [
      {
        field: "minQuantity",
        operator: "eq",
        value: 1,
      },
      {
        field: "brands",
        operator: "eq",
        value: filters.brands,
      },
      {
        field: "materials",
        operator: "eq",
        value: filters.materials,
      },
      {
        field: "soles",
        operator: "eq",
        value: filters.soles,
      },
      {
        field: "styles",
        operator: "eq",
        value: filters.styles,
      },
      {
        field: "tradeMarks",
        operator: "eq",
        value: filters.tradeMarks,
      },
      {
        field: "colors",
        operator: "eq",
        value: filters.colors,
      },
      {
        field: "sizes",
        operator: "eq",
        value: filters.sizes,
      },
    ],
    sorters: [
      {
        field: sorters.field,
        order: sorters.order,
      },
    ],
    pagination: pagination,
  });

  const [products, setProducts] = useState<IProductResponse[]>([]);

  useEffect(() => {
    if (dataProduct && dataProduct.data) {
      const fetchedProduct: IProductResponse[] = [...dataProduct.data];
      setProducts(fetchedProduct);
      setPagination((prevPagination) => ({
        ...prevPagination,
        total: dataProduct.total,
      }));
    }
  }, [dataProduct]);

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
        filters,
        setFilters,
        sorters,
        setSorters,
        products,
        refetchProducts,
        isLoadingProduct,
        pagination,
        setPagination,
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
