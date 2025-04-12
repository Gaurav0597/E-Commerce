import React from "react";

const Docs = async ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  console.log("slug", slug);
  return <div>Docs Home Page</div>;
};

export default Docs;
