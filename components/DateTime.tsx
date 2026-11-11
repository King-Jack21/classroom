interface DateTimeProps {
  value: number | Date;
  className?: string;
}

const formatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function DateTime({ value, className = "" }: DateTimeProps) {
  const date = typeof value === "number" ? new Date(value) : value;
  return (
    <time dateTime={date.toISOString()} className={className}>
      {formatter.format(date)}
    </time>
  );
}
