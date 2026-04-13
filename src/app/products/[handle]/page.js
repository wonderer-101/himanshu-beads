import { notFound } from "next/navigation";
import ProductDetailView from "@/components/product/ProductDetailView";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getAdminProductByHandle } from "@/lib/shopify/products";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await getAdminProductByHandle(handle);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} | Himanshu Beads`,
    description: product.description?.slice(0, 155) || "Premium jewellery from Himanshu Beads.",
  };
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const product = await getAdminProductByHandle(handle);
  if (!product) notFound();

  return (
    <>
      <Header />
      <ProductDetailView product={product} />
      <Footer />
    </>
  );
}