import { useThemedLayoutContext } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Card } from "antd";
import React, { useEffect } from "react";
import { POSTab } from "../../components/point-of-sales/POSTab";
import { POSContextProvider } from "../../contexts/point-of-sales";

export const PointOfSales: React.FC<IResourceComponentsProps> = () => {
  const { setSiderCollapsed } = useThemedLayoutContext();

  useEffect(() => {
    setSiderCollapsed(true);
  }, []);

  return (
    <Card
      className="w-100 h-100"
      styles={{
        body: {
          height: "100%",
        },
      }}
    >
      <POSContextProvider>
        <POSTab />
      </POSContextProvider>
    </Card>
  );
};
