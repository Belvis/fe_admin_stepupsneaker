import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import {
  IPaymentMethodResponse,
  IPaymentResponse,
  IProductResponse,
} from "../../../interfaces";
import { TablePaginationConfig } from "antd";
import { HttpError, useList } from "@refinedev/core";

type FilterType = {
  brands: string[];
  materials: string[];
  soles: string[];
  styles: string[];
  tradeMarks: string[];
  colors: string[];
  sizes: string[];
};

type DirectSalesContextType = {
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  pagination: TablePaginationConfig;
  setPagination: React.Dispatch<React.SetStateAction<TablePaginationConfig>>;
  pLayout: "vertical" | "horizontal";
  handleToggleLayout: () => void;
  filters: FilterType;
  setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
  products: IProductResponse[];
  isLoadingProduct: boolean;
};

export const DirectSalesContext = createContext<DirectSalesContextType>(
  {} as DirectSalesContextType
);

export const DirectSalesContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [discount, setDiscount] = useState(0);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const [filters, setFilters] = useState<FilterType>({
    brands: [],
    materials: [],
    soles: [],
    styles: [],
    tradeMarks: [],
    colors: [],
    sizes: [],
  });

  const {
    data,
    isLoading: isLoadingProduct,
    refetch,
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
    ],
    pagination: pagination,
  });

  const [products, setProducts] = useState<IProductResponse[]>([]);

  useEffect(() => {
    if (data && data.data) {
      const fetchedProduct: IProductResponse[] = [...data.data];
      setProducts(fetchedProduct);
      setPagination((prevPagination) => ({
        ...prevPagination,
        total: data.total,
      }));
    }
  }, [data]);

  const [pLayout, setpLayout] = useState<"horizontal" | "vertical">(
    "horizontal"
  );

  const handleToggleLayout = () => {
    setpLayout((prevLayout) =>
      prevLayout === "horizontal" ? "vertical" : "horizontal"
    );
  };

  return (
    <DirectSalesContext.Provider
      value={{
        discount,
        setDiscount,
        pagination,
        setPagination,
        pLayout,
        handleToggleLayout,
        filters,
        setFilters,
        products,
        isLoadingProduct,
      }}
    >
      {children}
    </DirectSalesContext.Provider>
  );
};
