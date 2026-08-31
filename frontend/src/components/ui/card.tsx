import * as React from "react";

function Card({
  className = "",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={`bg-card text-card-foreground flex flex-col rounded-xl border border-border shadow-sm ${className}`}
      {...props}
    />
  );
}

function CardContent({
  className = "",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={`px-4 pb-4 ${className}`}
      {...props}
    />
  );
}

export { Card, CardContent };