import { Create, SaveButton } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Button, Steps } from "antd";

import { useContext } from "react";
import { ReturnForm } from "../../components/return/ReturnForm";
import { ReturnOrderDetailsSelect } from "../../components/return/ReturnOrderDetailsSelect";
import { ReturnOrderSelect } from "../../components/return/ReturnOrderSelect";
import { ReturnFormContext } from "../../contexts/return";

export const ReturnCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { formLoading, saveButtonProps, currentStep, prev } =
    useContext(ReturnFormContext);

  const steps = [
    {
      title: t("return-forms.titles.steps.selectOrder"),
      content: <ReturnOrderSelect />,
    },
    {
      title: t("return-forms.titles.steps.selectProduct"),
      content: <ReturnOrderDetailsSelect />,
    },
    {
      title: t("return-forms.titles.steps.fillInformation"),
      content: <ReturnForm />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <Create
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      footerButtons={
        <>
          {currentStep > 0 && (
            <Button
              onClick={() => {
                prev();
              }}
            >
              {t("buttons.previousStep")}
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <SaveButton style={{ marginRight: 10 }} {...saveButtonProps} />
          )}
        </>
      }
    >
      <Steps
        current={currentStep}
        items={items}
        responsive
        size="small"
        className="mt-3 mb-3"
      />
      <div>{steps[currentStep].content}</div>
    </Create>
  );
};
