import dayjs from "dayjs";

export const disabledDate = (current: dayjs.Dayjs) => {
  const tenYearsAgo = dayjs().subtract(10, "year");
  const hundredYearsAgo = dayjs().subtract(100, "year");

  return current && (current > tenYearsAgo || current < hundredYearsAgo);
};
