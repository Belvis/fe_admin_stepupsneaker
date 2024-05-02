import {
  DashboardOutlined,
  ShopOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Breadcrumb, Card, Row } from "antd";
import { Fragment, useState } from "react";
import { CreateProdColorSection } from "../../../components/product/CreateProdColorSection";
import { CreateProdHeaderSection } from "../../../components/product/CreateProdHeaderSection";
import { CreateProdSizeSection } from "../../../components/product/CreateProdSizeSection";
import { ProdAttributeSelect } from "../../../components/product/ProdAttributeSelect";
import { ProductDetailTable } from "../../../components/product/ProductDetailTable";
import { IProductDetailResponse, IUserSelected } from "../../../interfaces";

export const ProductCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const [productDetails, setProductDetails] = useState<
    IProductDetailResponse[]
  >([]);

  const [userSelected, setUserSelected] = useState<IUserSelected>({
    tradeMark: undefined,
    style: undefined,
    size: undefined,
    material: undefined,
    color: undefined,
    brand: undefined,
    sole: undefined,
  });

  const beadcrumbItems = [
    {
      key: "pbc-home",
      href: "/",
      title: <DashboardOutlined />,
    },
    {
      title: (
        <>
          <ShopOutlined />
          <span>{t("shop.title")}</span>
        </>
      ),
    },
    {
      key: "pbc-products",
      href: "/shop/products",
      title: (
        <>
          <TagsOutlined />
          <span>{t("products.products")}</span>
        </>
      ),
    },
    {
      key: "pbc-create",
      title: t("actions.create"),
    },
  ];
  return (
    <Fragment>
      {/* Navi */}
      <Breadcrumb items={beadcrumbItems} />
      {/* Header */}
      <CreateProdHeaderSection
        userSelected={userSelected}
        setUserSelected={setUserSelected}
      />
      {/* Attribute select */}
      <Card style={{ marginTop: "0.1rem" }}>
        <Row gutter={[16, 24]} align="middle">
          {/* Brand */}
          <ProdAttributeSelect
            attributeName="brands"
            setUserSelected={setUserSelected}
          />
          {/* Style */}
          <ProdAttributeSelect
            attributeName="styles"
            setUserSelected={setUserSelected}
          />
          {/* Material */}
          <ProdAttributeSelect
            attributeName="materials"
            setUserSelected={setUserSelected}
          />
          {/* Trade Mark */}
          <ProdAttributeSelect
            attributeName="trade-marks"
            setUserSelected={setUserSelected}
          />
          {/* Sole */}
          <ProdAttributeSelect
            attributeName="soles"
            setUserSelected={setUserSelected}
          />
        </Row>
      </Card>
      {/* Size, color select */}
      <Card style={{ marginTop: "0.1rem" }}>
        <Row gutter={[16, 24]}>
          <CreateProdColorSection
            userSelected={userSelected}
            setUserSelected={setUserSelected}
            productDetails={productDetails}
            setProductDetails={setProductDetails}
          />
          <CreateProdSizeSection
            userSelected={userSelected}
            setUserSelected={setUserSelected}
            productDetails={productDetails}
            setProductDetails={setProductDetails}
          />
        </Row>
      </Card>
      {/* Product detail table */}
      <ProductDetailTable
        userSelected={userSelected}
        productDetails={productDetails}
        setProductDetails={setProductDetails}
      />
    </Fragment>
  );
};
