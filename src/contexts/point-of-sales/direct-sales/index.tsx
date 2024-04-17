import { TablePaginationConfig } from "antd";
import React, { PropsWithChildren, createContext, useState } from "react";

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
  pLayout: "vertical" | "horizontal";
  handleToggleLayout: () => void;
};

export const DirectSalesContext = createContext<DirectSalesContextType>(
  {} as DirectSalesContextType
);

export const DirectSalesContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [discount, setDiscount] = useState(0);

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
        pLayout,
        handleToggleLayout,
      }}
    >
      {children}
    </DirectSalesContext.Provider>
  );
};
