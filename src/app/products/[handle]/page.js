import { notFound } from "next/navigation";
import ProductDetailView from "@/components/product/ProductDetailView";
import { getAdminProductByHandle } from "@/lib/shopify/products";

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const product = await getAdminProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
