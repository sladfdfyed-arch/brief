import WheelPicker from "@/components/WheelPicker";
import { readProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await readProducts();
  return <WheelPicker products={products} />;
}
