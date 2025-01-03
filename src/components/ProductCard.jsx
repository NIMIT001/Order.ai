// ProductCard.js
import React from "react";

const ProductCard = ({ image, price, company, category }) => {
  return (
    <div className="border rounded-lg shadow-lg p-4 bg-white">
      <img
        src={image}
        alt={company}
        className="w-full h-40 object-cover rounded-md mb-4"
      />

      <h3 className="text-lg text-left align-text-top font-bold">
        category : {category}
      </h3>
      <h3 className="text-lg font-bold">{company}</h3>
      <p className="text-gray-600">Price: {price}</p>
    </div>
  );
};

export default ProductCard;
