import { useTranslate } from "@refinedev/core";
import { Card, Col, Image, Row, Typography } from "antd";
import { IProductResponse } from "../../interfaces";
const { Text, Title } = Typography;

type ProductItemProps = {
  product: IProductResponse;
  onClickFunction: (product: IProductResponse) => void;
  layout: "horizontal" | "vertical";
};

export const ProductItem: React.FC<ProductItemProps> = ({
  product,
  onClickFunction,
  layout,
}) => {
  const t = useTranslate();

  const { id, name, image, code, productDetails } = product;

  const totalQuantity = productDetails.reduce((total, productDetail) => {
    return total + productDetail.quantity;
  }, 0);

  const handleProductItemClick = () => {
    onClickFunction(product);
  };

  const renderHorizontalLayout = () => {
    return (
      <Col span={24} key={id}>
        <Card key={id} hoverable className="product-items">
          <Row gutter={[16, 24]} align="middle" justify="center">
            <Col span={6}>
              <Image src={image} />
            </Col>
            <Col span={18} onClick={handleProductItemClick}>
              <Row>
                <Title level={5}>
                  {name} / #{code}
                </Title>
              </Row>
              <Row>
                <Text>
                  {t("products.fields.quantity")}: x{totalQuantity}
                </Text>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
    );
  };

  const renderVerticalLayout = () => {
    return (
      <Col span={12} key={id}>
        <Card key={id} hoverable className="product-items">
          <Row gutter={[16, 24]} align="middle" justify="center">
            <Col span={24}>
              <Image src={image} />
            </Col>
            <Col span={24} onClick={handleProductItemClick}>
              <Title level={5}>
                {name} #{code}
              </Title>
              <Text>
                {t("products.fields.quantity")}: x{totalQuantity}
              </Text>
            </Col>
          </Row>
        </Card>
      </Col>
    );
  };

  return layout === "horizontal"
    ? renderHorizontalLayout()
    : renderVerticalLayout();
};
