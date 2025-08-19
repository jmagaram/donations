import { getCurrentDateIso, isFutureDate } from "../date";

interface DateViewProps {
  date: string;
}

const DateView = ({ date }: DateViewProps) => {
  const currentDate = getCurrentDateIso();
  const isInFuture = isFutureDate({ now: currentDate, other: date });

  return <span className={isInFuture ? "future" : ""}>{date}</span>;
};

export default DateView;
