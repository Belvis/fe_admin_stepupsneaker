import { useSimpleList } from "@refinedev/antd";
import { CrudFilters, HttpError, useTranslate } from "@refinedev/core";
import {
  List as AntdList,
  Avatar,
  Card,
  Checkbox,
  Col,
  ColorPicker,
  FormProps,
  Input,
  Space,
  Typography,
} from "antd";
import { debounce } from "lodash";
import { Fragment, useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import {
  IProductDetailFilterVariables,
  IProductDetailResponse,
} from "../../interfaces";
import { ProductSearchForm } from "../product/ProductSearchForm";

const { Title, Text } = Typography;

type PromotionRelationProps = {
  formProps: FormProps;
};

const PromotionRelation: React.FC<PromotionRelationProps> = ({ formProps }) => {
  const t = useTranslate();
  const { mode } = useContext(ColorModeContext);
  const { listProps, setFilters, searchFormProps } = useSimpleList<
    IProductDetailResponse,
    HttpError,
    IProductDetailFilterVariables
  >({
    resource: `product-details`,
    pagination: {
      pageSize: 5,
    },
    onSearch: ({
      status,
      brand,
      color,
      material,
      priceMax,
      priceMin,
      quantity,
      size,
      sole,
      style,
      tradeMark,
      q,
      hasPromotion,
      quantityMax,
      quantityMin,
    }) => {
      const productDetailFilters: CrudFilters = [];

      productDetailFilters.push({
        field: "status",
        operator: "eq",
        value: status ? status : undefined,
      });
      productDetailFilters.push({
        field: "hasPromotion",
        operator: "eq",
        value: hasPromotion ? hasPromotion : undefined,
      });
      productDetailFilters.push({
        field: "q",
        operator: "eq",
        value: q ? q.trim() : undefined,
      });

      productDetailFilters.push({
        field: "brands",
        operator: "eq",
        value: brand ? brand : undefined,
      });
      productDetailFilters.push({
        field: "colors",
        operator: "eq",
        value: color ? color : undefined,
      });
      productDetailFilters.push({
        field: "materials",
        operator: "eq",
        value: material ? material : undefined,
      });
      productDetailFilters.push({
        field: "sizes",
        operator: "eq",
        value: size ? size : undefined,
      });
      productDetailFilters.push({
        field: "soles",
        operator: "eq",
        value: sole ? sole : undefined,
      });
      productDetailFilters.push({
        field: "styles",
        operator: "eq",
        value: style ? style : undefined,
      });
      productDetailFilters.push({
        field: "tradeMarks",
        operator: "eq",
        value: tradeMark ? tradeMark : undefined,
      });
      productDetailFilters.push({
        field: "priceMin",
        operator: "eq",
        value: priceMin ? priceMin : undefined,
      });
      productDetailFilters.push({
        field: "priceMax",
        operator: "eq",
        value: priceMax ? priceMax : undefined,
      });
      productDetailFilters.push({
        field: "quantityMax",
        operator: "eq",
        value: quantityMax ? quantityMax : undefined,
      });
      productDetailFilters.push({
        field: "quantityMin",
        operator: "eq",
        value: quantityMin ? quantityMin : undefined,
      });
      productDetailFilters.push({
        field: "quantity",
        operator: "eq",
        value: quantity ? quantity : undefined,
      });

      return productDetailFilters;
    },
  });

  const [selectedIds, setselectedIds] = useState<string[]>([]);

  useEffect(() => {
    formProps.form?.setFieldValue("productDetails", selectedIds);
  }, [selectedIds]);

  const handleRowClick = (id: string) => {
    if (selectedIds.includes(id)) {
      setselectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setselectedIds([...selectedIds, id]);
    }
  };

  const handleSearch = debounce((value) => {
    setFilters([
      {
        field: "q",
        operator: "eq",
        value: value,
      },
    ]);
  }, 500);

  return (
    <Fragment>
      <Col span={24}>
        <Title level={5}>{t("promotions.steps.message")}</Title>
      </Col>
      <Col span={24}>
        <Card>
          <ProductSearchForm formProps={searchFormProps} />
        </Card>
      </Col>
      <Col span={24}>
        <AntdList
          {...listProps}
          itemLayout="horizontal"
          bordered
          style={{ padding: "1rem" }}
          renderItem={(item) => {
            const {
              id,
              product: { name },
              size,
              color,
              image,
              quantity,
            } = item;
            const isChecked = selectedIds.includes(id);

            return (
              <AntdList.Item
                key={id}
                actions={[<Checkbox checked={isChecked} onChange={() => {}} />]}
                onClick={() => handleRowClick(id)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    mode === "light" && isChecked ? "#fff2e8" : undefined,
                }}
              >
                <AntdList.Item.Meta
                  avatar={<Avatar size={52} src={image} />}
                  title={
                    <Space className="d-flex align-items-center">
                      <span>{name}</span>
                      <ColorPicker
                        defaultValue={color.code}
                        showText
                        disabled
                      />
                      <span>
                        {t("productDetails.fields.quantity")}: {quantity}
                      </span>
                    </Space>
                  }
                  description={
                    <Fragment>
                      <span>
                        {t("productDetails.fields.size")}: {size.name}
                      </span>
                      <br />
                      <span>
                        {t("productDetails.fields.color")}: {color.name}
                      </span>
                    </Fragment>
                  }
                />
              </AntdList.Item>
            );
          }}
        />
      </Col>
    </Fragment>
  );
};

export default PromotionRelation;
