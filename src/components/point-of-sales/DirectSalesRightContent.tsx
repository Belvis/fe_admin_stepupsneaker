import { HttpError, useList } from "@refinedev/core";
import { Col, Row, Skeleton, TablePaginationConfig } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { POSContext } from "../../contexts/point-of-sales";
import { IProductResponse } from "../../interfaces";
import { ProductItem } from "./ProductItem";
import { DirectSalesContext } from "../../contexts/point-of-sales/direct-sales";

type DirectSalesRightContentProps = {};

const DirectSalesRightContent: React.FC<
  DirectSalesRightContentProps
> = ({}) => {
  const { pLayout, pagination, setPagination } = useContext(DirectSalesContext);

  const { setSelectedProduct, productShow } = useContext(POSContext);

  const [products, setProducts] = useState<IProductResponse[]>([]);

  const [brandFilter, setBrandFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [soleFilter, setSoleFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [tradeMarkFilter, setTradeMarkFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");

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
        value: brandFilter,
      },
    ],
    pagination: pagination,
  });

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

  const handleProductClick = (product: IProductResponse) => {
    setSelectedProduct(product);
    productShow();
  };

  return (
    <Row gutter={[16, 24]} style={{ height: "100%", overflow: "auto" }}>
      <Col
        span={24}
        style={{
          maxHeight: "250px",
        }}
      >
        <Skeleton active loading={isLoadingProduct}>
          <Row gutter={[16, 24]}>
            {products.map((product) => (
              <ProductItem
                layout={pLayout}
                key={product.id}
                product={product}
                onClickFunction={handleProductClick}
              />
            ))}
          </Row>
        </Skeleton>
      </Col>
    </Row>
  );
};

export default DirectSalesRightContent;
