import { Col, Empty, Row, Skeleton } from "antd";
import React, { useContext } from "react";
import { POSContext } from "../../../contexts/point-of-sales";
import { DirectSalesContext } from "../../../contexts/point-of-sales/direct-sales";
import { IProductResponse } from "../../../interfaces";
import { ProductItem } from "../ProductItem";

type DirectSalesRightContentProps = {};

const DirectSalesRightContent: React.FC<
  DirectSalesRightContentProps
> = ({}) => {
  const { setSelectedProduct, productShow } = useContext(POSContext);
  const { pLayout, products, isLoadingProduct } =
    useContext(DirectSalesContext);

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
          overflowX: "hidden",
          padding: "12px",
        }}
      >
        <Skeleton active loading={isLoadingProduct}>
          {products.length > 0 ? (
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
          ) : (
            <Empty />
          )}
        </Skeleton>
      </Col>
    </Row>
  );
};

export default DirectSalesRightContent;
