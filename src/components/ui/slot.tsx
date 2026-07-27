import * as React from "react"

function Slot({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...(children.props as Record<string, unknown>),
    })
  }

  return null
}

Slot.displayName = "Slot"

export { Slot }
