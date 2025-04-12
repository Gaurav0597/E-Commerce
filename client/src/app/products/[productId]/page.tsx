import React from "react";

const ProductDetails = async ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) => {
  //   const productId = params.then((p) => p.productId);
  const resolvedParams = await params; 
  console.log(resolvedParams)
  const productId = resolvedParams.productId;


  return <h1>Details about product {productId}</h1>;
};

export default ProductDetails;
