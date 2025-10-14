// This will prevent authenticated users from accessing this route
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import type { ReactNode } from "react";

function OpenRoute({ children }: { children: ReactNode }) {
  const { token } = useSelector((state: any) => state.auth)

  if (token === null) {
    return children
  } else {
    return <Navigate to="/profile" />
  }
}

export default OpenRoute