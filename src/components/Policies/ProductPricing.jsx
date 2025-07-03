import React from 'react';

export default function ProductPricing() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 pt-8 pb-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 md:p-10 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          Product Pricing
        </h1>
        <div className="space-y-8 text-gray-700 text-lg">
          <p>
            At <strong>Shourk</strong>, our courses are designed to deliver maximum value at competitive prices.
          </p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Transparent Pricing:</strong>
              <p>
                All course prices are clearly listed on our website, ensuring complete transparency.
              </p>
            </li>
            <li>
              <strong>Inclusive of Taxes:</strong>
              <p>
                Prices include applicable taxes unless otherwise specified, so there are no hidden costs.
              </p>
            </li>
            <li>
              <strong>Discounts and Promotions:</strong>
              <p>
                Any available discounts or promotions will be automatically applied and reflected at the time of checkout.
              </p>
            </li>
            <li>
              <strong>Price Changes:</strong>
              <p>
                Prices are subject to change at our discretion; however, confirmed bookings will remain unaffected.
              </p>
            </li>
          </ol>
          <p>
            For detailed pricing, please visit the respective course pages on our website.
          </p>
        </div>
      </div>
    </div>
  );
}
