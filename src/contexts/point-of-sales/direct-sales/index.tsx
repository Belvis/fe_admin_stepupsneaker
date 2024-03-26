import { HttpError, useList } from "@refinedev/core";
import { TablePaginationConfig } from "antd";
import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import { IProductResponse } from "../../../interfaces";

export type FilterType = {
  brands: string[];
  materials: string[];
  soles: string[];
  styles: string[];
  tradeMarks: string[];
  colors: string[];
  sizes: string[];
};

export type SorterType = {
  field: string;
  order: "asc" | "desc";
};

export const blankFilters: FilterType = {
  brands: [],
  materials: [],
  soles: [],
  styles: [],
  tradeMarks: [],
  colors: [],
  sizes: [],
};

export const initialSorters: SorterType = {
  field: "updatedAt",
  order: "desc",
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
  sorters: SorterType;
  products: IProductResponse[];
  setSorters: React.Dispatch<React.SetStateAction<SorterType>>;
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
    pageSize: 6,
    total: 0,
  });

  const [filters, setFilters] = useState<FilterType>(blankFilters);
  const [sorters, setSorters] = useState<SorterType>(initialSorters);

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
        sorters,
        setSorters,
        products,
        isLoadingProduct,
      }}
    >
      {children}
    </DirectSalesContext.Provider>
  );
};
