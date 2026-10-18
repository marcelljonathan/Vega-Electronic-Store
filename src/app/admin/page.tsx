import { redirect } from "next/navigation";

// The admin home is the orders list.
export default function AdminHome() {
  redirect("/orders");
}
